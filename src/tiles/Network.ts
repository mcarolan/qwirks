import { Socket } from "socket.io-client";
import { IGameStateUpdater } from "~/IGameStateUpdater";
import { GameState } from "./GameState";
import { User } from "./User";

export class Network implements IGameStateUpdater {
  private setUsername: string | undefined;

  constructor(socket: Socket, user: User) {
    socket.on("connect", () => {
      socket.emit("user.identity", user.userId);

      socket.on("user.username", (username: string) => {
        this.setUsername = username;
      });

      socket.on("user.list", (users: [[string, string]]) => {
        console.log(`user list is ${JSON.stringify(users)}`);
      });
    });
  }

  update(gameState: GameState): GameState {
    if (this.setUsername) {
      const nextState = { ...gameState, username: this.setUsername };
      this.setUsername = undefined;
      return nextState;
    } else {
      return gameState;
    }
  }
}
