import { fromJS } from "immutable";
import { MouseState } from "~/game/Mouse";
import { Position, Tile } from "../../../shared/Domain";
import { GameState, singleActiveTile } from "../state/GameState";
import { rectContains } from "./domain";
import { TileGraphics } from "./TileGraphics";

export class TileGridGraphics {

  constructor(
    private tileGraphics: TileGraphics,
    private firstTileImage: HTMLImageElement
  ) {}

  update(gameState: GameState, mouseState: MouseState): void {
    if (gameState.tilePositionsPressed.length > 0) {
      gameState.tilePositionsPressed = new Array<Position>();
    }
    if (gameState.userInControl === gameState.currentUser.userId) {
      mouseState.clicks.forEach((c) => {
        if (rectContains(gameState.mainAreaBounds, c)) {
          const xy = this.tileGraphics.positionFromScreen(
            c,
            mouseState
          )
          gameState.tilePositionsPressed.push(xy);
        }
      });
    }
  }

  draw(context: CanvasRenderingContext2D, state: GameState, mouseState: MouseState): void {
    if (
      state.tilesToDisplay.length === 0 &&
      state.userInControl === state.currentUser.userId
    ) {
      const firstTilePosition = this.tileGraphics.screenCoords(
        { x: 0, y: 0 },
        mouseState
      );
      const firstTilePositionX = firstTilePosition.x;
      const firstTilePositionY =
        firstTilePosition.y -
        this.firstTileImage.height +
        this.tileGraphics.tileSize;
      context.drawImage(
        this.firstTileImage,
        firstTilePositionX,
        firstTilePositionY
      );
    }

    context.save();

    const hoveringTilePosition = this.tileGraphics.positionFromScreen(
      mouseState.mousePosition,
      mouseState
    );

    context.fillStyle = "#eeeeee";
    const screenCoords = this.tileGraphics.screenCoords(
      hoveringTilePosition,
      mouseState
    );

    var singleActive: [number, Tile] | undefined = singleActiveTile(state);

    if (singleActive) {
      context.save();
      context.globalAlpha = 0.5;
      this.tileGraphics.drawInactiveTile(
        context,
        screenCoords,
        singleActive[1],
        mouseState.scale
      );
      context.restore();
    } else if (state.isStarted) {
      context.fillRect(
        screenCoords.x,
        screenCoords.y,
        this.tileGraphics.tileSize * mouseState.scale,
        this.tileGraphics.tileSize * mouseState.scale
      );
    }

    for (const pt of state.tilesToDisplay) {
      const coords = this.tileGraphics.screenCoords(pt.position, mouseState);
      if (state.currentPlacement.placedTiles.contains(pt)) {
        this.tileGraphics.drawHoverTile(context, coords, pt, mouseState.scale);
      } else if (
        state.tilesLastPlaced.map((x) => fromJS(x)).contains(fromJS(pt))
      ) {
        this.tileGraphics.drawLastPlacementTile(context, coords, pt, mouseState.scale);
      } else {
        this.tileGraphics.drawInactiveTile(context, coords, pt, mouseState.scale);
      }
    }
    context.restore();
  }
}
