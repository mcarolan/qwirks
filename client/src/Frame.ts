import { GameDependencies } from "./GameDependencies";
import {
  MainState,
  reactStateFromGameState,
  shouldUpdateState,
} from "./MainState";
import { rectFromElement } from "./tiles/domain";
import { GameState } from "./tiles/GameState";

export interface MainStateFunctions {
  state: MainState;
  setState: (state: MainState, callback: () => void) => void;
}

function updateReactState(
  gameState: GameState,
  deps: GameDependencies,
  mainState: MainStateFunctions
): void {
  if (shouldUpdateState(mainState.state, gameState)) {
    mainState.setState(reactStateFromGameState(gameState), () => {
      console.log(`react state update ${JSON.stringify(mainState.state)}`);
      requestAnimationFrame((_) => frame(gameState, deps, mainState));
    });
  } else {
    requestAnimationFrame((_) => frame(gameState, deps, mainState));
  }
}

export function frame(
  gameState: GameState,
  deps: GameDependencies,
  mainState: MainStateFunctions
): void {
  gameState.mainAreaBounds = rectFromElement(deps.mainArea);

  deps.context.save();
  deps.canvas.width = gameState.mainAreaBounds.width;
  deps.canvas.height = gameState.mainAreaBounds.height;
  deps.context.clearRect(
    0,
    0,
    deps.context.canvas.width,
    deps.context.canvas.height
  );

  deps.mainComponentStateUpdater.update(gameState);
  deps.network.update(gameState);
  deps.mouse.update(gameState);
  deps.tileGrid.update(gameState);
  deps.gameLogic.update(gameState);
  deps.fireworkUpdater.update(gameState);
  deps.sounds.update(gameState);

  deps.context.scale(gameState.scale, gameState.scale);
  deps.tileGrid.draw(deps.context, gameState);
  deps.fireworks.updateAndDraw(deps.context);

  deps.context.restore();

  requestAnimationFrame((_) => updateReactState(gameState, deps, mainState));
}
