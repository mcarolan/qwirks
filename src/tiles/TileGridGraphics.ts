import { Position, Rect, Tile } from "./domain";
import { GameState } from "./GameState";
import { MouseDrag } from "./Mouse";
import { TileGraphics } from "./TileGraphics";

export class TileGridGraphics {
  private offset: Position;
  private effectiveOffset: Position;

  constructor() {
    this.offset = Position.ZERO;
    this.effectiveOffset = Position.ZERO;
  }

  private updateDragging(gameState: GameState): void {
    const delta = (e: MouseDrag) => e.from.minus(e.to);
    gameState.mouseEvents.forEach((e) => {
      if (e.type == "MouseDrag") {
        this.offset = this.offset.minus(delta(e));
      }
    });

    this.effectiveOffset = this.offset;

    if (gameState.mouseDragInProgress) {
      this.effectiveOffset = this.offset.minus(
        delta(gameState.mouseDragInProgress)
      );
    }
  }

  private mid(state: GameState): Position {
    return state.mainAreaBounds.middle().plus(this.effectiveOffset);
  }

  private updatePressedPositions(gameState: GameState): void {
    const tilePositionsPressed = new Array<Position>();
    gameState.mouseEvents.forEach((e) => {
      if (e.type == "MouseClick") {
        if (gameState.mainAreaBounds.contains(e.position)) {
          const xy = TileGraphics.positionFromScreen(
            e.position,
            this.mid(gameState)
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

  tilePositionToScreenCoords(
    tilePosition: Position,
    gameState: GameState
  ): Position {
    return TileGraphics.screenCoords(tilePosition, this.mid(gameState));
  }

  draw(context: CanvasRenderingContext2D, state: GameState): void {
    const mid = this.mid(state);
    context.save();
    const clippingRect = new Path2D();
    clippingRect.rect(
      state.mainAreaBounds.position.x,
      state.mainAreaBounds.position.y,
      state.mainAreaBounds.width,
      state.mainAreaBounds.height
    );
    context.clip(clippingRect);
    if (state.mousePosition) {
      const hoveringTilePosition = TileGraphics.positionFromScreen(
        state.mousePosition,
        mid
      );
      context.fillStyle = "#eeeeee";
      const screenCoords = TileGraphics.screenCoords(hoveringTilePosition, mid);

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
    for (const pt of state.tileGridToDisplay.values) {
      const coords = TileGraphics.screenCoords(pt.position, mid);
      if (state.currentPlacement.tiles.contains(pt)) {
        TileGraphics.drawHoverTile(context, coords, pt.tile);
      } else {
        TileGraphics.drawInactiveTile(context, coords, pt.tile);
      }
    }
    context.restore();
  }
}
