import { List, Set, Map } from "immutable";
import { User, UserWithStatus } from "~/../../shared/User";
import { ButtonTag } from "..";
import { Rect } from "./domain";
import { MouseClickOrDrag, MouseDrag } from "./Mouse";
import { TileGrid } from "./TileGrid";
import { Tile, PositionedTile, Position } from "../../../shared/Domain";

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
    public gameKey: string,
    public isStarted: boolean,
    public isConnected: boolean,
    public hand: List<Tile>,
    public tileGridToDisplay: TileGrid,
    public tileGridApplied: TileGrid,
    public mousePosition: Position | undefined,
    public mouseEvents: Array<MouseClickOrDrag>,
    public tilePositionsPressed: Array<Position>,
    public pressedButtonTags: Set<ButtonTag>,
    public enabledButtonTags: Set<ButtonTag>,
    public visibleButtonTags: Set<ButtonTag>,
    public panelActiveTileIndicies: Set<number>,
    public score: number,
    public scoreJustAchieved: number,
    public fireworkTilePositions: List<Position>,
    public currentPlacement: CurrentPlacementState,
    public mainAreaBounds: Rect,
    public bottomPanelBounds: Rect,
    public currentUser: User,
    public userList: Map<string, UserWithStatus>,
    public userInControl: string | undefined,
    public mouseDragInProgress: MouseDrag | undefined,
    public panelHoverTileIndex: number | undefined
  ) {}

  static initial(
    gameKey: string,
    user: User,
    mainAreaBounds: Rect,
    bottomPanelBounds: Rect
  ): GameState {
    const tileGrid = TileGrid.empty();

    return new GameState(
      gameKey,
      false,
      false,
      List.of(),
      tileGrid,
      tileGrid,
      new Position(0, 0),
      [],
      [],
      Set.of(),
      Set.of(),
      Set.of(),
      Set.of(),
      1,
      0,
      List.of(),
      new CurrentPlacementState(Set.of(), tileGrid, 0, Set.of()),
      mainAreaBounds,
      bottomPanelBounds,
      user,
      Map(),
      undefined,
      undefined,
      undefined
    );
  }
}
