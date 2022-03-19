import { User, UserWithStatus } from "../../shared/User";
import { is, List, Map, Set as ImmSet } from "immutable";
import { ButtonTag } from "./button/ButtonTag";
import { Tile } from "../../shared/Domain";
import { loadUserFromLocalStorage } from "./browser/BrowserAPI";
import { GameState } from "./tiles/GameState";

export interface MainState {
  userList: Map<string, UserWithStatus>;
  currentUser: User;
  isConnected: boolean;
  isStarted: boolean;
  enabledButtonTags: ImmSet<ButtonTag>;
  visibleButtonTags: ImmSet<ButtonTag>;
  userInControl: string | undefined;
  hand: List<Tile>;
  activeTileIndicies: ImmSet<number>;
  tilesPlaced: number;
  winner: string | undefined;
  turnTimer: number | undefined;
  turnStartTime: number | undefined;
}

export const initialMainState: MainState = {
  userList: Map(),
  isConnected: false,
  isStarted: false,
  enabledButtonTags: ImmSet(),
  visibleButtonTags: ImmSet(),
  hand: List(),
  activeTileIndicies: ImmSet(),
  currentUser: loadUserFromLocalStorage(),
  userInControl: undefined,
  tilesPlaced: 0,
  winner: undefined,
  turnTimer: undefined,
  turnStartTime: undefined,
};

export function shouldUpdateState(state: MainState, gameState: GameState): boolean {
  return (
    !is(state.currentUser, gameState.currentUser) ||
    !is(state.userList, gameState.userList) ||
    !is(state.isConnected, gameState.isConnected) ||
    !is(state.isStarted, gameState.isStarted) ||
    !is(state.enabledButtonTags, gameState.enabledButtonTags) ||
    !is(state.visibleButtonTags, gameState.visibleButtonTags) ||
    !is(state.userInControl, gameState.userInControl) ||
    !is(state.hand, gameState.hand) ||
    !is(state.activeTileIndicies, gameState.panelActiveTileIndicies) ||
    !is(state.tilesPlaced, gameState.tilesApplied.length) ||
    !is(state.activeTileIndicies, gameState.winner) ||
    !is(state.turnStartTime, gameState.turnStartTime) ||
    !is(state.turnTimer, gameState.turnTimer)
  );
}

export function reactStateFromGameState(
  gameState: GameState
): MainState {
  return {
    userList: gameState.userList,
    currentUser: gameState.currentUser,
    isConnected: gameState.isConnected,
    isStarted: gameState.isStarted,
    enabledButtonTags: gameState.enabledButtonTags,
    visibleButtonTags: gameState.visibleButtonTags,
    userInControl: gameState.userInControl,
    hand: gameState.hand,
    activeTileIndicies: gameState.panelActiveTileIndicies,
    tilesPlaced: gameState.tilesApplied.length,
    winner: gameState.winner,
    turnStartTime: gameState.turnStartTime,
    turnTimer: gameState.turnTimer,
  };
}