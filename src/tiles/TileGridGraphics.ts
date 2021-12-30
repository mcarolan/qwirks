import { Position, Rect, Tile } from "./domain";
import { TileGraphics } from "./TileGraphics";
import { TileGrid } from "./TileGrid";
import { Map, is } from "immutable";

const PADDING = 10;

export class TileGridGraphics {
  private tileRects: Map<Position, Tile>;

  constructor(
    readonly tilegrid: TileGrid,
    readonly canvasRect: Rect,
    readonly mid: Position
  ) {
    const elems: Array<[Position, Tile]> = new Array(tilegrid.size);

    for (const pt of tilegrid.values) {
      elems.push([TileGraphics.screenCoords(pt.position, this.mid), pt.tile]);
    }

    this.tileRects = Map<Position, Tile>(elems);
  }

  nextTileGrid(newCanvasRect: Rect, newMid: Position): TileGridGraphics {
    if (!is(this.canvasRect, newCanvasRect) || !is(this.mid, newMid)) {
      return new TileGridGraphics(this.tilegrid, newCanvasRect, newMid);
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
