import { IGameStateUpdater } from "~/IGameStateUpdater";
import { GameState, singleActiveTile } from "./GameState";
import { MouseDrag } from "./Mouse";
import { TileGraphics } from "./TileGraphics";
import { Position, Tile, minus, plus } from "../../../shared/Domain";
import { middle, rectContains } from "./domain";
import { fromJS, Set } from "immutable";

export class TileGridGraphics implements IGameStateUpdater {
  private offset: Position;
  private effectiveOffset: Position;

  constructor(
    private tileGraphics: TileGraphics,
    private firstTileImage: HTMLImageElement
  ) {
    this.offset = { x: 0, y: 0 };
    this.effectiveOffset = { x: 0, y: 0 };
  }

  private updateDragging(gameState: GameState): void {
    const delta = (e: MouseDrag) => minus(e.from, e.to);
    gameState.mouseEvents.forEach((e) => {
      if (e.type == "MouseDrag") {
        this.offset = minus(this.offset, delta(e));
      }
    });

    this.effectiveOffset = this.offset;

    if (gameState.mouseDragInProgress) {
      this.effectiveOffset = minus(
        this.offset,
        delta(gameState.mouseDragInProgress)
      );
    }
  }

  private mid(state: GameState): Position {
    return plus(middle(state.mainAreaBounds), this.effectiveOffset);
  }

  private updatePressedPositions(gameState: GameState): void {
    if (gameState.tilePositionsPressed.length > 0) {
      gameState.tilePositionsPressed = new Array<Position>();
    }

    gameState.mouseEvents.forEach((e) => {
      if (e.type == "MouseClick") {
        if (rectContains(gameState.mainAreaBounds, e.position)) {
          const xy = this.tileGraphics.positionFromScreen(
            e.position,
            this.mid(gameState)
          );
          gameState.tilePositionsPressed.push(xy);
        }
      }
    });
  }

  update(gameState: GameState): void {
    if (gameState.tilesToDisplay.length > 0) {
      this.updateDragging(gameState);
    }
    if (gameState.userInControl === gameState.currentUser.userId) {
      this.updatePressedPositions(gameState);
    }
  }

  tilePositionToScreenCoords(
    tilePosition: Position,
    gameState: GameState
  ): Position {
    return this.tileGraphics.screenCoords(tilePosition, this.mid(gameState));
  }

  draw(context: CanvasRenderingContext2D, state: GameState): void {
    const mid = this.mid(state);

    if (
      state.tilesToDisplay.length === 0 &&
      state.userInControl === state.currentUser.userId
    ) {
      const firstTilePosition = this.tileGraphics.screenCoords(
        { x: 0, y: 0 },
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
    }

    context.save();

    const hoveringTilePosition = this.tileGraphics.positionFromScreen(
      state.mousePosition,
      mid
    );

    context.fillStyle = "#eeeeee";
    const screenCoords = this.tileGraphics.screenCoords(
      hoveringTilePosition,
      mid
    );

    var singleActive: [number, Tile] | undefined = singleActiveTile(state);

    if (singleActive) {
      context.save();
      context.globalAlpha = 0.5;
      this.tileGraphics.drawInactiveTile(
        context,
        screenCoords,
        singleActive[1]
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

    for (const pt of state.tilesToDisplay) {
      const coords = this.tileGraphics.screenCoords(pt.position, mid);
      if (state.currentPlacement.placedTiles.contains(pt)) {
        this.tileGraphics.drawHoverTile(context, coords, pt);
      } else {
        this.tileGraphics.drawInactiveTile(context, coords, pt);
      }
    }
    context.restore();
  }
}
