import { Socket } from "socket.io-client";
import { IGameStateUpdater } from "~/IGameStateUpdater";
import { GameState } from "./GameState";
import { User, UserWithStatus } from "./User";
import { Map } from "immutable";

export class Network implements IGameStateUpdater {
  private setUserList: Map<string, UserWithStatus> | undefined;
  constructor(socket: Socket, user: User) {
    socket.on("connect", () => {
      socket.emit("user.identity", user);

      socket.on("user.list", (users: [[string, UserWithStatus]]) => {
        this.setUserList = Map(users);
      });
    });
  }

  update(gameState: GameState): GameState {
    const nextUserList = this.setUserList ?? gameState.userList;

    return {
      ...gameState,
      userList: nextUserList,
    };
  }
}
