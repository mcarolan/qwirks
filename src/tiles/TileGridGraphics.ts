import { Position, Rect, Tile } from "./domain";
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

  tilePositionToScreenCoords(tilePosition: Position): Position {
    return TileGraphics.screenCoords(tilePosition, this.effectiveMid);
  }

  draw(context: CanvasRenderingContext2D, state: GameState): void {
    if (state.mousePosition) {
      const hoveringTilePosition = TileGraphics.positionFromScreen(
        state.mousePosition,
        this.effectiveMid
      );
      context.fillStyle = "#eeeeee";
      const screenCoords = TileGraphics.screenCoords(
        hoveringTilePosition,
        this.effectiveMid
      );

      var singleActiveTile: Tile | undefined = undefined;

      if (state.panelActiveTileIndicies.size == 1) {
        const index = state.panelActiveTileIndicies.first();
        if (index != undefined) {
          singleActiveTile = state.hand.get(index);
        }
      }

      if (singleActiveTile) {
        context.save();
        context.globalAlpha = 0.5;
        TileGraphics.drawInactiveTile(context, screenCoords, singleActiveTile);
        context.restore();
      } else {
        context.fillRect(
          screenCoords.x,
          screenCoords.y,
          TileGraphics.tileWidth,
          TileGraphics.tileHeight
        );
      }
    }
    for (const pt of state.tileGrid.values) {
      const coords = TileGraphics.screenCoords(pt.position, this.effectiveMid);
      if (state.currentPlacementSet.contains(pt)) {
        TileGraphics.drawHoverTile(context, coords, pt.tile);
      } else {
        TileGraphics.drawInactiveTile(context, coords, pt.tile);
      }
    }
  }
}
