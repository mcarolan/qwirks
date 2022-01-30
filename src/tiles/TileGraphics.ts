import { Position, Tile, TileColour, TileShape } from "./domain";
import { loadImage } from "./utility";

async function loadImageCache(): Promise<
  Map<TileColour, Map<TileShape, HTMLImageElement>>
> {
  const colours: Map<TileColour, Map<TileShape, HTMLImageElement>> = new Map();

  for (const colour of [
    TileColour.Blue,
    TileColour.Green,
    TileColour.Orange,
    TileColour.Purple,
    TileColour.Red,
    TileColour.Yellow,
  ]) {
    const shapes: Map<TileShape, HTMLImageElement> = new Map();
    for (const shape of [
      TileShape.One,
      TileShape.Two,
      TileShape.Three,
      TileShape.Four,
      TileShape.Five,
      TileShape.Six,
    ]) {
      const src = `./images/${shape.toString()}-${colour.toString()}.png`;
      shapes.set(shape, await loadImage(src));
    }
    colours.set(colour, shapes);
  }

  return colours;
}

let imageCache: Map<string, Map<string, HTMLImageElement>>;

let emptyTileImage: HTMLImageElement;
let blankTileImage: HTMLImageElement;
let hoverTileImage: HTMLImageElement;
let activeTileImage: HTMLImageElement;

let symWidth: number;
let symHeight: number;

export async function initialiseTileGraphics() {
  imageCache = await loadImageCache();
  emptyTileImage = await loadImage("./images/empty-tile.png");
  blankTileImage = await loadImage("./images/blank-tile.png");
  hoverTileImage = await loadImage("./images/hover-tile.png");
  activeTileImage = await loadImage("./images/active-tile.png");
  symWidth = emptyTileImage.width / 2;
  symHeight = emptyTileImage.height / 2;
}

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
