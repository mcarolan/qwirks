import { List, Set, Map } from "immutable";
import { PositionedTile, Tile } from "../../shared/Domain";
import { UserWithStatus } from "../../shared/User";
import { TileBag } from "./TileBag";

export interface Game {
  users: Map<string, UserWithStatus>;
  isStarted: boolean;
  isOver: boolean;
  tileBag: TileBag;
  hands: Map<string, List<Tile>>;
  tiles: PositionedTile[];
  tilesLastPlaced: Set<PositionedTile>;
  userInControl: string | undefined;
  turnStartTime: number | undefined;
  turnTimer: number | undefined;
  lastWrite: number;
}

export const initialGame: Game = {
  users: Map(),
  isStarted: false,
  isOver: false,
  tileBag: TileBag.full(),
  hands: Map(),
  tiles: [],
  tilesLastPlaced: Set(),
  userInControl: undefined,
  turnStartTime: undefined,
  turnTimer: undefined,
  lastWrite: 0,
};
