import { Socket } from "socket.io-client";
import { GameState } from "./GameState";
import { User } from "./User";

export class Network {
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

  updateGameState(gameState: GameState): void {
    if (this.setUsername) {
      gameState.username = this.setUsername;
      this.setUsername = undefined;
      console.log(`set username to ${gameState.username}`);
    }
  }
}
