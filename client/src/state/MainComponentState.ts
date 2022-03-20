import { User, UserWithStatus } from "../../../shared/User";
import { is, List, Map, Set as ImmSet } from "immutable";
import { ButtonTag } from "../component/Button";
import { Tile } from "../../../shared/Domain";
import {
  changeUsernameInLocalStorage,
  loadUserFromLocalStorage,
} from "../browser/BrowserAPI";
import { capScale, GameState } from "./GameState";
import { MainStateFunctions } from "../game/Frame";

export interface MainComponentGameState {
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

export interface MainComponentUIState {
  buttonsClicked: ImmSet<ButtonTag>;
  handTilesClicked: ImmSet<number>;
  zoomInPressed: number;
  zoomOutPressed: number;
  selectedTurnTimer: number | undefined;
  setUsername: string | undefined;
}

export interface MainCompmonentState {
  game: MainComponentGameState;
  ui: MainComponentUIState;
}

export const initialMainComponentState: MainCompmonentState = {
  game: {
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
  },
  ui: {
    buttonsClicked: ImmSet(),
    handTilesClicked: ImmSet(),
    zoomInPressed: 0,
    zoomOutPressed: 0,
    selectedTurnTimer: undefined,
    setUsername: undefined,
  },
};

function shouldUpdateState(
  state: MainComponentGameState,
  gameState: GameState
): boolean {
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

function reactStateFromGameState(gameState: GameState): MainComponentGameState {
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

export function syncReactAndGameState(
  mainComponent: MainStateFunctions,
  gameState: GameState,
  cb: () => void
): void {
  var resetUiState = false;
  if (mainComponent.state.ui.buttonsClicked.size > 0) {
    gameState.pressedButtonTags = mainComponent.state.ui.buttonsClicked;
    resetUiState = true;
  } else {
    gameState.pressedButtonTags = ImmSet();
  }

  if (mainComponent.state.ui.handTilesClicked.size > 0) {
    gameState.panelActiveTileIndicies = gameState.panelActiveTileIndicies.withMutations(
      (m) => {
        for (const i of mainComponent.state.ui.handTilesClicked) {
          if (m.has(i)) {
            m.delete(i);
          } else {
            m.add(i);
          }
        }
      }
    );
    resetUiState = true;
  }

  const netZoomChange =
    mainComponent.state.ui.zoomInPressed +
    mainComponent.state.ui.zoomOutPressed * -1;

  if (netZoomChange != 0) {
    gameState.scale = capScale(gameState.scale + netZoomChange * 0.1);
    resetUiState = true;
  }

  if (mainComponent.state.ui.setUsername) {
    gameState.setUsername = mainComponent.state.ui.setUsername;
    gameState.currentUser = {
      ...gameState.currentUser,
      username: mainComponent.state.ui.setUsername,
    };
    changeUsernameInLocalStorage(mainComponent.state.ui.setUsername);
    resetUiState = true;
  }

  gameState.turnTimerSelected = mainComponent.state.ui.selectedTurnTimer;

  const uiState: MainComponentUIState = resetUiState
    ? {
        buttonsClicked: ImmSet(),
        handTilesClicked: ImmSet(),
        zoomInPressed: 0,
        zoomOutPressed: 0,
        selectedTurnTimer: mainComponent.state.ui.selectedTurnTimer,
        setUsername: undefined,
      }
    : mainComponent.state.ui;

  const newState: MainCompmonentState = {
    ui: uiState,
    game: reactStateFromGameState(gameState),
  };

  if (resetUiState || shouldUpdateState(mainComponent.state.game, gameState)) {
    mainComponent.setState((_) => newState, cb);
  } else {
    setTimeout(cb, 0);
  }
}
