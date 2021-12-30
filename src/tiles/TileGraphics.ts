import { Position, Tile, TileColour, TileShape } from "./domain";
import { forIn } from "lodash";
import { loadImage } from "./utility";

function loadImageCache(): Map<TileColour, Map<TileShape, HTMLImageElement>> {
  let colours: Map<TileColour, Map<TileShape, HTMLImageElement>> = new Map();

  forIn(TileColour, (colourValue, _) => {
    let shapes: Map<TileShape, HTMLImageElement> = new Map();
    forIn(TileShape, (shapeValue, _) => {
      const src = `./images/${shapeValue.toString()}-${colourValue.toString()}.png`;
      shapes.set(shapeValue, loadImage(src));
    });
    colours.set(colourValue, shapes);
  });

  return colours;
}

const imageCache: Map<string, Map<string, HTMLImageElement>> = loadImageCache();

const emptyTileImage = loadImage("./images/empty-tile.png");
const blankTileImage = loadImage("./images/blank-tile.png");
const hoverTileImage = loadImage("./images/hover-tile.png");
const activeTileImage = loadImage("./images/active-tile.png");

const symWidth = emptyTileImage.width / 2;
const symHeight = emptyTileImage.height / 2;

const PADDING = 10;

export class TileGraphics {
  static drawEmptyTile(
    context: CanvasRenderingContext2D,
    position: Position
  ): void {
    context.drawImage(
      emptyTileImage,
      position.x,
      position.y,
      emptyTileImage.width,
      emptyTileImage.height
    );
  }

  static get tileWidth(): number {
    return emptyTileImage.width;
  }

  static get tileHeight(): number {
    return emptyTileImage.height;
  }

  static drawHoverTile(
    context: CanvasRenderingContext2D,
    position: Position,
    tile: Tile
  ): void {
    this.drawTile(context, position, tile, hoverTileImage);
  }

  static drawInactiveTile(
    context: CanvasRenderingContext2D,
    position: Position,
    tile: Tile
  ): void {
    this.drawTile(context, position, tile, blankTileImage);
  }

  static drawActiveTile(
    context: CanvasRenderingContext2D,
    position: Position,
    tile: Tile
  ): void {
    this.drawTile(context, position, tile, activeTileImage);
  }

  private static drawTile(
    context: CanvasRenderingContext2D,
    position: Position,
    tile: Tile,
    tileBackground: HTMLImageElement
  ): void {
    context.drawImage(
      tileBackground,
      position.x,
      position.y,
      blankTileImage.width,
      blankTileImage.height
    );
    const inner = imageCache
      .get(tile.colour)
      ?.get(tile.shape) as HTMLImageElement;

    if (inner) {
      context.drawImage(
        inner,
        position.x + symWidth / 2,
        position.y + symHeight / 2,
        symWidth,
        symHeight
      );
    }
  }

  static screenCoords(pos: Position, mid: Position): Position {
    const tileX = pos.x * TileGraphics.tileWidth + pos.x * PADDING;
    const tileY = pos.y * TileGraphics.tileHeight + pos.y * PADDING;
    return new Position(mid.x + tileX, mid.y + tileY);
  }

  static positionFromScreen(screen: Position, mid: Position): Position {
    const tileX = (screen.x - mid.x) / (TileGraphics.tileWidth + PADDING);
    const tileY = (screen.y - mid.y) / (TileGraphics.tileHeight + PADDING);
    return new Position(Math.floor(tileX), Math.floor(tileY));
  }
}
