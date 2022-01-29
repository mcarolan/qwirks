import { Socket } from "socket.io-client";
import { IGameStateUpdater } from "~/IGameStateUpdater";
import { GameState } from "./GameState";
import { User, UserWithStatus } from "./User";
import { Map } from "immutable";

export class Network implements IGameStateUpdater {
  private setUserList: Map<string, UserWithStatus> | undefined;
  private setConnected: boolean | undefined;

  constructor(socket: Socket, user: User) {
    socket.on("connect", () => {
      this.setConnected = true;
      socket.emit("user.identity", user);

      socket.on("user.list", (users: [[string, UserWithStatus]]) => {
        this.setUserList = Map(users);
      });
    });

    socket.on("disconnect", () => {
      this.setConnected = false;
    });
  }

  update(gameState: GameState): GameState {
    const nextUserList = this.setUserList ?? gameState.userList;
    const connected = this.setConnected ?? gameState.isConnected;

    return {
      ...gameState,
      userList: nextUserList,
      isConnected: connected,
    };
  }
}
