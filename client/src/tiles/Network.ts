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
      console.log("connected");
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

  update(gameState: GameState): void {
    gameState.userList = this.setUserList ?? gameState.userList;
    gameState.isConnected = this.setConnected ?? gameState.isConnected;
    gameState.isStarted = this.setGameStarted ?? gameState.isStarted;
    gameState.hand = this.hand ?? gameState.hand;
    gameState.tilesApplied = this.setTiles ?? gameState.tilesApplied;
    const previousUserInControl = gameState.userInControl;
    gameState.userInControl = this.setUserInControl ?? gameState.userInControl;

    if (
      previousUserInControl != gameState.currentUser.userId &&
      gameState.userInControl === gameState.currentUser.userId
    ) {
      gameState.playYourGoSound = true;
    }

    this.setGameStarted = undefined;
    this.setConnected = undefined;
    this.setGameStarted = undefined;
    this.hand = undefined;
    this.setUserInControl = undefined;
    this.setTiles = undefined;

    if (
      !gameState.isStarted &&
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

    if (gameState.setUsername != undefined) {
      console.log("set username");
      this.socket.emit("user.setusername", gameState.setUsername);
      gameState.setUsername = undefined;
    }
  }
}
