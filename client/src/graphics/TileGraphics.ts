import { MouseState, screenToWorld, worldToScreen } from "../game/Mouse";
import {
  allTileColours,
  allTileShapes,
  Position,
  Tile,
  TileColour,
  TileShape,
} from "../../../shared/Domain";
import { loadImage } from "./domain";
import { Map } from "immutable";

export async function loadTileGraphics(context: CanvasRenderingContext2D): Promise<TileGraphics> {
  if (!TileGraphicElements.tileBackgroundGradient) {
    TileGraphicElements.tileBackgroundGradient = context.createRadialGradient(300, 100, 0, 300, 100, 316.23);
    TileGraphicElements.tileBackgroundGradient.addColorStop(0.82, 'rgba(0, 0, 0, 1)');
    TileGraphicElements.tileBackgroundGradient.addColorStop(1, 'rgba(102, 102, 102, 1)');

    TileGraphicElements.tileBackgroundPath = new Path2D("M 8 0 L 56 0 C 64 0 64 0 64 8 L 64 56 C 64 64 64 64 56 64 L 8 64 C 0 64 0 64 0 56 L 0 8 C 0 0 0 0 8 0");
    
    TileGraphicElements.tileBorderHover = context.createLinearGradient(0, 100, 600, 100);
    TileGraphicElements.tileBorderHover.addColorStop(0.77, 'rgba(211, 84, 0, 1)');
    TileGraphicElements.tileBorderHover.addColorStop(1, 'rgba(0, 0, 0, 1)');

    TileGraphicElements.tileBorderInactive = context.createLinearGradient(0, 100, 600, 100);
    TileGraphicElements.tileBorderInactive.addColorStop(0.77, 'rgba(42, 42, 42, 1)');
    TileGraphicElements.tileBorderInactive.addColorStop(1, 'rgba(0, 0, 0, 1)');

    TileGraphicElements.tileBorderActive = context.createLinearGradient(0, 100, 600, 100);
    TileGraphicElements.tileBorderActive.addColorStop(0.77, 'rgba(0, 159, 212, 1)');
    TileGraphicElements.tileBorderActive.addColorStop(1, 'rgba(0, 0, 0, 1)');

    TileGraphicElements.tileBorderLastPlay = context.createLinearGradient(0, 100, 600, 100);
    TileGraphicElements.tileBorderLastPlay.addColorStop(0.77, 'rgba(0, 170, 0, 1)');
    TileGraphicElements.tileBorderLastPlay.addColorStop(1, 'rgba(0, 0, 0, 1)');

    TileGraphicElements.lastPlacementTileImage = await loadImage(
      "./images/lastplacement-tile.png"
    );
  }

  return new TileGraphics();
}

class TileGraphicElements {
  public static tileBackgroundGradient: CanvasGradient;
  public static tileBackgroundPath: Path2D;
  public static tileBorderInactive: CanvasGradient;
  public static tileBorderHover: CanvasGradient;
  public static tileBorderActive: CanvasGradient;
  public static tileBorderLastPlay: CanvasGradient;
  public static shapes: Map<TileShape, Path2D> = Map([
    [TileShape.One, new Path2D("M 9.877 30.782 L 10.343 21.657 L 1.218 22.123 L 8 16 L 1.218 9.877 L 10.343 10.343 L 9.877 1.218 L 16 8 L 22.123 1.218 L 21.657 10.343 L 30.782 9.877 L 24 16 L 30.782 22.123 L 21.657 21.657 L 22.123 30.782 L 16 24 Z")],
    [TileShape.Two, new Path2D("M 0 0 L 32 0 L 32 32 L 0 32 L 0 0")],
    [TileShape.Three, new Path2D("M 16 0 L 32 12 L 28 32 L 4 32 L 0 12 L 16 0")],
    [TileShape.Four, new Path2D("M 16 0 A 1 1 0 0 0 16 32 A 1 1 0 0 0 16 0")],
    [TileShape.Five, new Path2D("M 16 0 L 19 3 L 19 13 L 29 13 L 32 16 L 29 19 L 19 19 L 19 29 L 16 32 L 13 29 L 13 19 L 3 19 L 0 16 L 3 13 L 13 13 L 13 3 L 16 0")],
    [TileShape.Six, new Path2D("M 16 0 L 28 16 L 17 32 L 4 16 L 16 0")]
  ]);
  public static colours: Map<TileColour, string> = Map([
    [TileColour.Blue, "#f56600"],
    [TileColour.Green, "#e60d2e"],
    [TileColour.Orange, "#00abc9"],
    [TileColour.Purple, "#e026a3"],
    [TileColour.Red, "#ffffff"],
    [TileColour.Yellow, "#e6b012"]
  ]);
  public static lastPlacementTileImage: HTMLImageElement;
}

export class TileGraphics {
  static PADDING = 10;

  public readonly tileSize = 64;

  private readonly tileStrokeSolid: number[] = [];
  private readonly tileStrokeDashed: number[] = [8, 4]

  drawHoverTile(
    context: CanvasRenderingContext2D,
    position: Position,
    tile: Tile,
    scale: number
  ): void {
    this.drawTile(context, position, tile, TileGraphicElements.tileBorderHover, this.tileStrokeSolid, scale);
  }

  drawInactiveTile(
    context: CanvasRenderingContext2D,
    position: Position,
    tile: Tile,
    scale: number
  ): void {
    this.drawTile(context, position, tile, TileGraphicElements.tileBorderInactive, this.tileStrokeSolid, scale);
  }

  drawActiveTile(
    context: CanvasRenderingContext2D,
    position: Position,
    tile: Tile,
    scale: number
  ): void {
    this.drawTile(context, position, tile, TileGraphicElements.tileBorderActive, this.tileStrokeSolid, scale);
  }

  drawLastPlacementTile(
    context: CanvasRenderingContext2D,
    position: Position,
    tile: Tile,
    scale: number
  ): void {
    this.drawTile(context, position, tile, TileGraphicElements.tileBorderLastPlay, this.tileStrokeDashed, scale);
  }

  private drawBackground(context: CanvasRenderingContext2D, stroke: CanvasGradient, strokeDash: number[], position: Position, scale: number): void {
    context.save();
    context.fillStyle = TileGraphicElements.tileBackgroundGradient;
    context.translate(position.x, position.y);
    context.scale(scale, scale);
    context.fill(TileGraphicElements.tileBackgroundPath);
    context.strokeStyle = stroke;
    context.setLineDash(strokeDash);
    context.lineWidth = 5;
    context.stroke(TileGraphicElements.tileBackgroundPath);
    context.restore();
  }

  private drawInner(context: CanvasRenderingContext2D, tile: Tile, position: Position, scale: number): void {
    const colour = TileGraphicElements.colours.get(tile.colour);
    const shape = TileGraphicElements.shapes.get(tile.shape);

    if (colour && shape) {
      context.save();
      context.fillStyle = TileGraphicElements.colours.get(tile.colour) ?? "black";
      context.translate(position.x, position.y);
      context.scale(scale, scale);
      context.fill(shape);
      context.restore();
    }
  }

  private drawTile(
    context: CanvasRenderingContext2D,
    position: Position,
    tile: Tile,
    stroke: CanvasGradient,
    strokeDash: number[],
    scale: number
  ): void {
    this.drawBackground(context, stroke, strokeDash, position, scale);
    const innerPosition: Position = { x: position.x + ((this.tileSize * scale) / 2 / 2), y: position.y + ((this.tileSize * scale) / 2 / 2)};
    this.drawInner(context, tile, innerPosition, scale);
  }

  screenCoords(pos: Position, mouseState: MouseState): Position {
    const tileX = pos.x * this.tileSize + pos.x * TileGraphics.PADDING;
    const tileY = pos.y * this.tileSize + pos.y * TileGraphics.PADDING;
    return worldToScreen({ x: tileX, y: tileY }, mouseState);
  }

  positionFromScreen(screen: Position, mouseState: MouseState): Position {
    const world = screenToWorld(screen, mouseState);
    return { x: Math.floor(world.x / (this.tileSize + TileGraphics.PADDING)), y: Math.floor(world.y / (this.tileSize + TileGraphics.PADDING)) };
  }
}
