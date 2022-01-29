import { List, Set, Map } from "immutable";
import { Fireworks } from "~/fireworks/Fireworks";
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
import { User, UserWithStatus } from "./User";

export class CurrentPlacementState {
  constructor(
    public tiles: Set<PositionedTile>,
    public tileGrid: TileGrid,
    public score: number,
    public lines: Set<Set<PositionedTile>>
  ) {}
}
export class GameState {
  constructor(
    public hand: List<Tile>,
    public tileBag: TileBag,
    public tileGridToDisplay: TileGrid,
    public tileGridApplied: TileGrid,
    public mousePosition: Position | undefined,
    public mouseEvents: Array<MouseClickOrDrag>,
    public tilePositionsPressed: Array<Position>,
    public pressedButtonTags: Set<string>,
    public enabledButtonTags: Set<string>,
    public panelActiveTileIndicies: Set<number>,
    public score: number,
    public scoreJustAchieved: number,
    public fireworkTilePositions: List<Position>,
    public currentPlacement: CurrentPlacementState,
    public mainAreaBounds: Rect,
    public bottomPanelBounds: Rect,
    public currentUser: User,
    public userList: Map<string, UserWithStatus>,
    public mouseDragInProgress: MouseDrag | undefined,
    public panelHoverTileIndex: number | undefined
  ) {}

  static initial(user: User): GameState {
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
      tgResult.tileGrid,
      tgResult.tileGrid,
      new Position(0, 0),
      [],
      [],
      Set.of(),
      Set.of(),
      Set.of(),
      1,
      0,
      List.of(),
      new CurrentPlacementState(Set.of(), tgResult.tileGrid, 0, Set.of()),
      new Rect(new Position(0, 0), 0, 0),
      new Rect(new Position(0, 0), 0, 0),
      user,
      Map(),
      undefined,
      undefined
    );
  }
}
