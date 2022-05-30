import { Socket } from "socket.io-client";
import { IGameStateUpdater } from "~/game/IGameStateUpdater";
import { GameState } from "~/state/GameState";
import { List, Map, Set } from "immutable";
import { User, UserWithStatus } from "../../../shared/User";
import { PositionedTile, Tile } from "../../../shared/Domain";
import { ButtonTag } from "../component/Button";

export class Network implements IGameStateUpdater {
  private setUserList: Map<string, UserWithStatus> | undefined;
  private setConnected: boolean | undefined;
  private setGameStarted: boolean | undefined;
  private hand: List<Tile> | undefined;
  private setUserInControl: string | undefined;
  private setTiles: PositionedTile[] | undefined;
  private setTilesLastPlaced: Set<PositionedTile> | undefined;
  private setWinner: string | undefined;
  private setTurnStartTime: number | undefined;
  private setTurnTimer: number | undefined;

  constructor(private socket: Socket, private user: User, gameKey: string) {
    this.socket.on("connect", () => {
      console.log("connected");
      this.setConnected = true;
      this.socket.emit("user.identity", this.user, gameKey);

      this.socket.on("user.list", (users: [[string, UserWithStatus]]) => {
        console.log(`user list update ${JSON.stringify(users)}`);
        this.setUserList = Map(users);
      });

      this.socket.on("user.hand", (userId: string, tiles: Tile[]) => {
        console.log(`hand update for ${userId}`);
        if (userId === user.userId) {
          this.hand = List(tiles);
        }
      });

      this.socket.on("game.started", (turnTimer: number | undefined) => {
        console.log("game started update");
        this.setGameStarted = true;
        this.setTurnTimer = turnTimer;
      });

      this.socket.on("game.over", (winner: string) => {
        console.log(`winner ${winner}`);
        this.setWinner = winner;
      });

      this.socket.on(
        "game.tiles",
        (tiles: PositionedTile[], tilesLastPlaced: PositionedTile[]) => {
          console.log("game tiles update");
          this.setTiles = tiles;
          this.setTilesLastPlaced = Set(tilesLastPlaced);
          console.log(tilesLastPlaced);
        }
      );

      this.socket.on(
        "user.incontrol",
        (userId: string, turnStartTime: number) => {
          this.setUserInControl = userId;
          this.setTurnStartTime = turnStartTime;
        }
      );
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
    gameState.tilesLastPlaced =
      this.setTilesLastPlaced ?? gameState.tilesLastPlaced;
    const previousUserInControl = gameState.userInControl;
    gameState.userInControl = this.setUserInControl ?? gameState.userInControl;
    gameState.winner = this.setWinner ?? gameState.winner;
    gameState.turnStartTime = this.setTurnStartTime ?? gameState.turnStartTime;
    gameState.turnTimer = this.setTurnTimer ?? gameState.turnTimer;

    if (gameState.newUserInControl != undefined) {
      gameState.newUserInControl = undefined;
    }

    if (previousUserInControl != gameState.userInControl) {
      gameState.newUserInControl = gameState.userInControl;
    }

    this.setGameStarted = undefined;
    this.setConnected = undefined;
    this.setGameStarted = undefined;
    this.hand = undefined;
    this.setUserInControl = undefined;
    this.setTiles = undefined;
    this.setWinner = undefined;
    this.setTurnStartTime = undefined;
    this.setTurnTimer = undefined;

    if (
      !gameState.isStarted &&
      gameState.pressedButtonTags.contains(ButtonTag.Start)
    ) {
      console.log("game start");
      this.socket.emit("game.start", gameState.turnTimerSelected);
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
