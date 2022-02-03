import { plus, Position } from "../../../shared/Domain";
import { GameState } from "./GameState";

export class Score {
  constructor() {}

  private statusText(gameState: GameState): string | undefined {
    if (!gameState.isStarted) {
      return "Invite 2 to 4 players and press Start!";
    } else if (gameState.userInControl === gameState.currentUser.userId) {
      return "It's your go!";
    } else {
      const usernameInControl = gameState.userList.get(
        gameState.userInControl ?? ""
      )?.username;

      if (usernameInControl) {
        return `Waiting for ${usernameInControl} to play!`;
      } else {
        return undefined;
      }
    }
  }

  draw(context: CanvasRenderingContext2D, gameState: GameState) {
    const scorePosition = plus(gameState.mainAreaBounds.position, {
      x: 10,
      y: 10,
    });
    context.save();
    context.font = "48px serif";
    const score = (
      gameState.userList.get(gameState.currentUser.userId)?.score ?? 0
    ).toString();
    context.textBaseline = "top";
    context.fillStyle = "black";
    context.fillText(score, scorePosition.x, scorePosition.y);

    if (gameState.currentPlacement.score > 0) {
      const scoreWidth = context.measureText(score).width;
      const additionalScore = ` + ${gameState.currentPlacement.score}`;
      context.save();
      context.fillStyle = "blue";
      context.fillText(
        additionalScore,
        scorePosition.x + scoreWidth,
        scorePosition.y
      );
      context.restore();
    }

    const status = this.statusText(gameState);

    if (status) {
      const statusWidth = context.measureText(status).width;
      context.fillText(
        status,
        gameState.mainAreaBounds.position.x +
          gameState.mainAreaBounds.width / 2 -
          statusWidth / 2,
        scorePosition.y
      );
    }

    context.restore();
  }
}
