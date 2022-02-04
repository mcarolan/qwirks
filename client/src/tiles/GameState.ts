import { List, Set as ImmSet, Map } from "immutable";
import { User, UserWithStatus } from "~/../../shared/User";
import { ButtonTag } from "..";
import { Rect } from "./domain";
import { MouseClickOrDrag, MouseDrag } from "./Mouse";
import { Tile, PositionedTile, Position } from "../../../shared/Domain";

export interface CurrentPlacementState {
  placedTiles: ImmSet<PositionedTile>;
  tiles: PositionedTile[];
  score: number;
  lines: ImmSet<ImmSet<PositionedTile>>;
}

export interface GameState {
  gameKey: string;
  isStarted: boolean;
  isConnected: boolean;
  hand: List<Tile>;
  tilesToDisplay: PositionedTile[];
  tilesApplied: PositionedTile[];
  tilesToApply: PositionedTile[] | undefined;
  tilesToSwap: Tile[] | undefined;
  mousePosition: Position;
  mouseEvents: Array<MouseClickOrDrag>;
  tilePositionsPressed: Array<Position>;
  pressedButtonTags: ImmSet<ButtonTag>;
  enabledButtonTags: ImmSet<ButtonTag>;
  visibleButtonTags: ImmSet<ButtonTag>;
  panelActiveTileIndicies: Set<number>;
  scoreJustAchieved: number;
  fireworkTilePositions: List<Position>;
  currentPlacement: CurrentPlacementState;
  mainAreaBounds: Rect;
  bottomPanelBounds: Rect;
  currentUser: User;
  userList: Map<string, UserWithStatus>;
  userInControl: string | undefined;
  mouseDragInProgress: MouseDrag | undefined;
  panelHoverTileIndex: number | undefined;
}

export function singleActiveTile(
  gameState: GameState
): [number, Tile] | undefined {
  if (gameState.panelActiveTileIndicies.size === 1) {
    for (const n of gameState.panelActiveTileIndicies) {
      const t = gameState.hand.get(n);
      return t ? [n, t] : undefined;
    }
  } else {
    return undefined;
  }
}

export function initialGameState(
  gameKey: string,
  user: User,
  mainAreaBounds: Rect,
  bottomPanelBounds: Rect
): GameState {
  return {
    gameKey: gameKey,
    isStarted: false,
    isConnected: false,
    hand: List.of(),
    tilesToDisplay: [],
    tilesApplied: [],
    tilesToApply: undefined,
    tilesToSwap: undefined,
    mousePosition: { x: 0, y: 0 },
    mouseEvents: [],
    tilePositionsPressed: [],
    pressedButtonTags: ImmSet(),
    enabledButtonTags: ImmSet(),
    visibleButtonTags: ImmSet(),
    panelActiveTileIndicies: new Set(),
    scoreJustAchieved: 0,
    fireworkTilePositions: List.of(),
    currentPlacement: {
      placedTiles: ImmSet(),
      tiles: [],
      score: 0,
      lines: ImmSet.of(),
    },
    mainAreaBounds,
    bottomPanelBounds,
    currentUser: user,
    userList: Map(),
    userInControl: undefined,
    mouseDragInProgress: undefined,
    panelHoverTileIndex: undefined,
  };
}
