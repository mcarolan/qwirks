import { Position } from "./domain";
import { GameState } from "./GameState";

export class Score {
  constructor(readonly position: Position) {}

  draw(context: CanvasRenderingContext2D, gameState: GameState) {
    context.save();
    context.font = "48px serif";
    const score = gameState.score.toString();
    context.textBaseline = "top";
    context.fillStyle = "black";
    context.fillText(score, this.position.x, this.position.y);

    if (gameState.currentPlacement.score > 0) {
      const scoreWidth = context.measureText(score).width;
      const additionalScore = ` + ${gameState.currentPlacement.score}`;
      context.fillStyle = "blue";
      context.fillText(
        additionalScore,
        this.position.x + scoreWidth,
        this.position.y
      );
    }

    context.restore();
  }
}
