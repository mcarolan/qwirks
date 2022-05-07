import { fromJS } from "immutable";
import { divideScalar, minus, mul, plus, Position, Tile } from "../../../shared/Domain";
import { IGameStateUpdater } from "../game/IGameStateUpdater";
import { MouseDrag } from "../game/Mouse";
import { GameState, singleActiveTile } from "../state/GameState";
import { middle, rectContains } from "./domain";
import { TileGraphics } from "./TileGraphics";

export class TileGridGraphics implements IGameStateUpdater {
  private offset: Position;
  private effectiveOffset: Position;
  private lastMid: Position | undefined;

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
      if (e.type == "MouseZoom") {
        this.offset = divideScalar(e.point, gameState.scale);
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
            this.mid(gameState),
            gameState.scale
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
      mid,
      state.scale
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
        singleActive[1],
        1
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
        this.tileGraphics.drawHoverTile(context, coords, pt, 1);
      } else if (
        state.tilesLastPlaced.map((x) => fromJS(x)).contains(fromJS(pt))
      ) {
        this.tileGraphics.drawLastPlacementTile(context, coords, pt, 1);
      } else {
        this.tileGraphics.drawInactiveTile(context, coords, pt, 1);
      }
    }

    if (this.lastMid) {
      context.fillStyle = 'red';
      context.fillRect(this.lastMid.x, this.lastMid.y, 10, 10);
    }
    context.restore();
  }
}
