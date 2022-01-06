import { Position, Rect } from "./domain";
import { GameState } from "./GameState";
import { MouseDrag } from "./Mouse";
import { TileGraphics } from "./TileGraphics";

export class TileGridGraphics {
  private mid: Position;
  private effectiveMid: Position;

  constructor(readonly tileGridRect: Rect) {
    this.mid = tileGridRect.middle();
    this.effectiveMid = tileGridRect.middle();
  }

  private updateDragging(gameState: GameState): void {
    const delta = (e: MouseDrag) => e.from.minus(e.to);
    gameState.mouseEvents.forEach((e) => {
      if (e.type == "MouseDrag") {
        this.mid = this.mid.minus(delta(e));
      }
    });

    this.effectiveMid = this.mid;

    if (gameState.mouseDragInProgress) {
      this.effectiveMid = this.mid.minus(delta(gameState.mouseDragInProgress));
    }
  }

  private updatePressedPositions(gameState: GameState): void {
    const tilePositionsPressed = new Array<Position>();
    gameState.mouseEvents.forEach((e) => {
      if (e.type == "MouseClick") {
        if (this.tileGridRect.contains(e.position)) {
          const xy = TileGraphics.positionFromScreen(
            e.position,
            this.effectiveMid
          );
          tilePositionsPressed.push(xy);
        }
      }
    });

    gameState.tilePositionsPressed = tilePositionsPressed;
  }

  updateGameState(state: GameState): void {
    this.updateDragging(state);
    this.updatePressedPositions(state);
  }

  draw(context: CanvasRenderingContext2D, state: GameState): void {
    for (const pt of state.tileGrid.values) {
      const coords = TileGraphics.screenCoords(pt.position, this.effectiveMid);
      TileGraphics.drawInactiveTile(context, coords, pt.tile);
    }
  }
}
