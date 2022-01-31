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

export async function loadTileGraphics(): Promise<TileGraphics> {
  const imageCache = await loadImageCache();
  const emptyTileImage = await loadImage("./images/empty-tile.png");
  const blankTileImage = await loadImage("./images/blank-tile.png");
  const hoverTileImage = await loadImage("./images/hover-tile.png");
  const activeTileImage = await loadImage("./images/active-tile.png");
  const symWidth = emptyTileImage.width / 2;
  const symHeight = emptyTileImage.height / 2;

  return new TileGraphics(
    imageCache,
    emptyTileImage,
    blankTileImage,
    hoverTileImage,
    activeTileImage,
    symWidth,
    symHeight
  );
}

const PADDING = 10;

export class TileGraphics {
  constructor(
    readonly imageCache: Map<string, Map<string, HTMLImageElement>>,
    readonly emptyTileImage: HTMLImageElement,
    readonly blankTileImage: HTMLImageElement,
    readonly hoverTileImage: HTMLImageElement,
    readonly activeTileImage: HTMLImageElement,
    readonly symWidth: number,
    readonly symHeight: number
  ) {}
  drawEmptyTile(context: CanvasRenderingContext2D, position: Position): void {
    context.drawImage(
      this.emptyTileImage,
      position.x,
      position.y,
      this.emptyTileImage.width,
      this.emptyTileImage.height
    );
  }

  get tileWidth(): number {
    return this.emptyTileImage.width;
  }

  get tileHeight(): number {
    return this.emptyTileImage.height;
  }

  drawHoverTile(
    context: CanvasRenderingContext2D,
    position: Position,
    tile: Tile
  ): void {
    this.drawTile(context, position, tile, this.hoverTileImage);
  }

  drawInactiveTile(
    context: CanvasRenderingContext2D,
    position: Position,
    tile: Tile
  ): void {
    this.drawTile(context, position, tile, this.blankTileImage);
  }

  drawActiveTile(
    context: CanvasRenderingContext2D,
    position: Position,
    tile: Tile
  ): void {
    this.drawTile(context, position, tile, this.activeTileImage);
  }

  private drawTile(
    context: CanvasRenderingContext2D,
    position: Position,
    tile: Tile,
    tileBackground: HTMLImageElement
  ): void {
    context.drawImage(
      tileBackground,
      position.x,
      position.y,
      this.blankTileImage.width,
      this.blankTileImage.height
    );
    const inner = this.imageCache
      .get(tile.colour)
      ?.get(tile.shape) as HTMLImageElement;

    if (inner) {
      context.drawImage(
        inner,
        position.x + this.symWidth / 2,
        position.y + this.symHeight / 2,
        this.symWidth,
        this.symHeight
      );
    }
  }

  screenCoords(pos: Position, mid: Position): Position {
    const tileX = pos.x * this.tileWidth + pos.x * PADDING;
    const tileY = pos.y * this.tileHeight + pos.y * PADDING;
    return new Position(mid.x + tileX, mid.y + tileY);
  }

  positionFromScreen(screen: Position, mid: Position): Position {
    const tileX = (screen.x - mid.x) / (this.tileWidth + PADDING);
    const tileY = (screen.y - mid.y) / (this.tileHeight + PADDING);
    return new Position(Math.floor(tileX), Math.floor(tileY));
  }
}
