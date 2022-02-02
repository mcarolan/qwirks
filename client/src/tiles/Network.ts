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

  private firstUpdate: boolean = true;

  constructor(private socket: Socket, private user: User) {}

  update(gameState: GameState): GameState {
    if (this.firstUpdate) {
      this.socket.on("connect", () => {
        this.setConnected = true;
        this.socket.emit("user.identity", this.user, gameState.gameKey);

        this.socket.on("user.list", (users: [[string, UserWithStatus]]) => {
          this.setUserList = Map(users);
        });

        this.socket.on("user.hand", (tiles: Tile[]) => {
          this.hand = List(tiles);
        });

        this.socket.on("game.started", () => {
          this.setGameStarted = true;
        });

        this.socket.on("game.tiles", (tiles: PositionedTile[]) => {
          //TODO: hack, methods get stripped otherise
          this.setTiles = tiles.map(
            (t) => new PositionedTile(t.tile, t.position)
          );
        });

        this.socket.on("user.incontrol", (userId: string) => {
          this.setUserInControl = userId;
        });
      });

      this.socket.on("disconnect", () => {
        this.setConnected = false;
      });
      this.firstUpdate = false;
    }

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
      this.socket.emit("game.start");
    }

    if (gameState.tilesToApply != undefined) {
      this.socket.emit("game.applytiles", gameState.tilesToApply);
      gameState.tilesToApply = undefined;
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
