import { Socket } from "socket.io-client";
import { IGameStateUpdater } from "~/IGameStateUpdater";
import { GameState } from "./GameState";
import { List, Map } from "immutable";
import { User, UserWithStatus } from "../../../shared/User";
import { ButtonTag } from "..";
import { PositionedTile, Tile } from "../../../shared/Domain";

export class Network implements IGameStateUpdater {
  private setUserList: Map<string, UserWithStatus> | undefined;
  private setConnected: boolean | undefined;
  private setGameStarted: boolean | undefined;
  private hand: List<Tile> | undefined;
  private setUserInControl: string | undefined;
  private setTiles: PositionedTile[] | undefined;

  constructor(private socket: Socket, private user: User, gameKey: string) {
    this.socket.on("connect", () => {
      this.setConnected = true;
      this.socket.emit("user.identity", this.user, gameKey);

      this.socket.on("user.list", (users: [[string, UserWithStatus]]) => {
        console.log("user list update");
        this.setUserList = Map(users);
      });

      this.socket.on("user.hand", (tiles: Tile[]) => {
        console.log("hand update");
        this.hand = List(tiles);
      });

      this.socket.on("game.started", () => {
        console.log("game started update");
        this.setGameStarted = true;
      });

      this.socket.on("game.tiles", (tiles: PositionedTile[]) => {
        console.log("game tiles update");
        this.setTiles = tiles;
      });

      this.socket.on("user.incontrol", (userId: string) => {
        console.log("user in control update");
        this.setUserInControl = userId;
      });
    });

    this.socket.on("disconnect", () => {
      this.setConnected = false;
    });
  }

  update(gameState: GameState): GameState {
    const nextUserList = this.setUserList ?? gameState.userList;
    const connected = this.setConnected ?? gameState.isConnected;
    const nextGameStarted = this.setGameStarted ?? gameState.isStarted;
    const nextHand = this.hand ?? gameState.hand;
    const nextUserInControl = this.setUserInControl ?? gameState.userInControl;
    const nextTiles = this.setTiles ?? gameState.tilesApplied;

    this.setGameStarted = undefined;
    this.setConnected = undefined;
    this.setGameStarted = undefined;
    this.hand = undefined;
    this.setUserInControl = undefined;

    if (
      !nextGameStarted &&
      gameState.pressedButtonTags.contains(ButtonTag.Start)
    ) {
      console.log("game start");
      this.socket.emit("game.start");
    }

    if (gameState.tilesToApply != undefined) {
      console.log("apply tiles");
      this.socket.emit("game.applytiles", gameState.tilesToApply);
      gameState.tilesToApply = undefined;
    }

    if (gameState.tilesToSwap != undefined) {
      console.log("swap tiles");
      this.socket.emit("game.swap", gameState.tilesToSwap);
      gameState.tilesToSwap = undefined;
    }

    return {
      ...gameState,
      userList: nextUserList,
      isConnected: connected,
      isStarted: nextGameStarted,
      hand: nextHand,
      userInControl: nextUserInControl,
      tilesApplied: nextTiles,
    };
  }
}
