import { Position, Rect } from "./domain";
import { GameLogic } from "./GameLogic";
import { GameState } from "./GameState";

export class Button {
  private currentImage: HTMLImageElement;
  public rect: Rect;

  constructor(
    readonly mainAreaOffset: Position,
    readonly inactive: HTMLImageElement,
    readonly hover: HTMLImageElement,
    readonly tag: string
  ) {
    this.currentImage = inactive;
    this.rect = new Rect(new Position(0, 0), inactive.width, inactive.height);
  }

  updateGameState(gameState: GameState): void {
    this.rect = new Rect(
      new Position(
        gameState.mainAreaBounds.width,
        gameState.mainAreaBounds.position.y
      ).plus(this.mainAreaOffset),
      this.inactive.width,
      this.inactive.height
    );
    var hovering = false;
    var isClicked = false;

    if (gameState.mousePosition) {
      gameState.mouseEvents.forEach((e) => {
        if (e.type == "MouseClick" && this.rect.contains(e.position)) {
          isClicked = true;
          return false;
        }
      });

      hovering = this.rect.contains(gameState.mousePosition);
    }

    const enabled = gameState.enabledButtonTags.contains(this.tag);

    this.currentImage =
      hovering && !isClicked && enabled ? this.hover : this.inactive;

    gameState.setButtonPressed(this.tag, isClicked && enabled);
  }

  draw(context: CanvasRenderingContext2D, gameState: GameState) {
    const opacity = gameState.enabledButtonTags.contains(this.tag) ? 1.0 : 0.4;
    context.save();
    context.globalAlpha = opacity;
    context.drawImage(
      this.currentImage,
      this.rect.position.x,
      this.rect.position.y
    );
    context.restore();
  }
}
