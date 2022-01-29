import { Socket } from "socket.io-client";
import { IGameStateUpdater } from "~/IGameStateUpdater";
import { GameState } from "./GameState";
import { User } from "./User";
import { Map } from "immutable";

export class Network implements IGameStateUpdater {
  private setUsername: string | undefined;
  private setUserList: Map<string, string> | undefined;
  constructor(socket: Socket, user: User) {
    socket.on("connect", () => {
      socket.emit("user.identity", user.userId);

      socket.on("user.username", (username: string) => {
        this.setUsername = username;
      });

      socket.on("user.list", (users: [[string, string]]) => {
        this.setUserList = Map(users);
      });
    });
  }

  update(gameState: GameState): GameState {
    const nextUsername = this.setUsername ?? gameState.username;
    const nextUserList = this.setUserList ?? gameState.userList;

    return {
      ...gameState,
      username: nextUsername,
      userList: nextUserList,
    };
  }
}
