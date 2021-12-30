import { Position, Rect, Tile } from "./domain";
import { TileGraphics } from "./TileGraphics";
import { TileGrid } from "./TileGrid";
import { Map, is } from "immutable";

const PADDING = 10;

export class TileGridGraphics {
  private tileRects: Map<Position, Tile>;
  private mid: Position;

  constructor(readonly tilegrid: TileGrid, readonly canvasRect: Rect) {
    this.mid = canvasRect.middle();

    const elems: Array<[Position, Tile]> = new Array(tilegrid.size);

    for (const pt of tilegrid.values) {
      elems.push([TileGraphics.screenCoords(pt.position, this.mid), pt.tile]);
    }

    this.tileRects = Map<Position, Tile>(elems);
  }

  nextPanel(newCanvasRect: Rect): TileGridGraphics {
    if (!is(this.canvasRect, newCanvasRect)) {
      return new TileGridGraphics(this.tilegrid, newCanvasRect);
    } else {
      return this;
    }
  }

  draw(context: CanvasRenderingContext2D): void {
    this.tileRects.forEach((tile, position) => {
      TileGraphics.drawInactiveTile(context, position, tile);
    });
  }
}
