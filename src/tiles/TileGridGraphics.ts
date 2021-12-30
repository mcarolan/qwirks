import { Position, Rect, Tile } from "./domain";
import { TileGraphics } from "./TileGraphics";
import { TileGrid } from "./TileGrid";

export class TileGridGraphics {
  static draw(
    context: CanvasRenderingContext2D,
    mid: Position,
    tileGrid: TileGrid
  ): void {
    for (const pt of tileGrid.values) {
      const coords = TileGraphics.screenCoords(pt.position, mid);
      TileGraphics.drawInactiveTile(context, coords, pt.tile);
    }
  }
}
