import { List, Set } from "immutable";
import {
  Position,
  PositionedTile,
  Rect,
  Success,
  Tile,
  TileColour,
  TileShape,
} from "./domain";
import { MouseClickOrDrag, MouseDrag } from "./Mouse";
import { TileBag } from "./TileBag";
import { TileGrid } from "./TileGrid";

export class GameState {
  constructor(
    public hand: List<Tile>,
    public tileBag: TileBag,
    public canvasRect: Rect,
    public tileGrid: TileGrid,
    public mousePosition: Position | undefined,
    public mouseEvents: Array<MouseClickOrDrag>,
    public mouseDragInProgress: MouseDrag | undefined,
    public panelActiveTileIndex: number | undefined,
    public panelHoverTileIndex: number | undefined
  ) {}

  static initial(canvasRect: Rect): GameState {
    const tgResult = TileGrid.empty().place(
      Set.of(
        new PositionedTile(
          new Tile(TileColour.Blue, TileShape.Four),
          new Position(0, 0)
        )
      )
    ) as Success;

    var [hand, tileBag] = TileBag.full().take(6);

    return new GameState(
      hand,
      tileBag,
      canvasRect,
      tgResult.tileGrid,
      new Position(0, 0),
      [],
      undefined,
      undefined,
      undefined
    );
  }
}
