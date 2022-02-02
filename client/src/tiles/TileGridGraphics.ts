import { IGameStateUpdater } from "~/IGameStateUpdater";
import { GameState } from "./GameState";
import { MouseDrag } from "./Mouse";
import { TileGraphics } from "./TileGraphics";
import { Position, Tile } from "../../../shared/Domain";

export class TileGridGraphics implements IGameStateUpdater {
  private offset: Position;
  private effectiveOffset: Position;

  constructor(
    private tileGraphics: TileGraphics,
    private firstTileImage: HTMLImageElement
  ) {
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

  private updatePressedPositions(gameState: GameState): GameState {
    const tilePositionsPressed = new Array<Position>();
    gameState.mouseEvents.forEach((e) => {
      if (e.type == "MouseClick") {
        if (gameState.mainAreaBounds.contains(e.position)) {
          const xy = this.tileGraphics.positionFromScreen(
            e.position,
            this.mid(gameState)
          );
          tilePositionsPressed.push(xy);
        }
      }
    });

    return { ...gameState, tilePositionsPressed: tilePositionsPressed };
  }

  update(gameState: GameState): GameState {
    this.updateDragging(gameState);
    return this.updatePressedPositions(gameState);
  }

  tilePositionToScreenCoords(
    tilePosition: Position,
    gameState: GameState
  ): Position {
    return this.tileGraphics.screenCoords(tilePosition, this.mid(gameState));
  }

  draw(context: CanvasRenderingContext2D, state: GameState): void {
    const mid = this.mid(state);

    const firstTilePosition = this.tileGraphics.screenCoords(
      Position.ZERO,
      mid
    );
    const firstTilePositionX = firstTilePosition.x;
    const firstTilePositionY =
      firstTilePosition.y -
      this.firstTileImage.height +
      this.tileGraphics.tileHeight;
    context.drawImage(
      this.firstTileImage,
      firstTilePositionX,
      firstTilePositionY
    );

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
      const hoveringTilePosition = this.tileGraphics.positionFromScreen(
        state.mousePosition,
        mid
      );
      context.fillStyle = "#eeeeee";
      const screenCoords = this.tileGraphics.screenCoords(
        hoveringTilePosition,
        mid
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
        this.tileGraphics.drawInactiveTile(
          context,
          screenCoords,
          singleActiveTile
        );
        context.restore();
      } else {
        context.fillRect(
          screenCoords.x,
          screenCoords.y,
          this.tileGraphics.tileWidth,
          this.tileGraphics.tileHeight
        );
      }
    }
    for (const pt of state.tileGridToDisplay.values) {
      const coords = this.tileGraphics.screenCoords(pt.position, mid);
      if (state.currentPlacement.tiles.contains(pt)) {
        this.tileGraphics.drawHoverTile(context, coords, pt.tile);
      } else {
        this.tileGraphics.drawInactiveTile(context, coords, pt.tile);
      }
    }
    context.restore();
  }
}
