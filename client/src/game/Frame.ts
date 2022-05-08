import { GameDependencies } from "./GameDependencies";
import {
  MainCompmonentState,
  syncReactAndGameState,
} from "../state/MainComponentState";
import { rectFromElement } from "../graphics/domain";
import { GameState } from "~/state/GameState";

export interface MainStateFunctions {
  state: MainCompmonentState;
  setState: (
    stateFn: (state: Readonly<MainCompmonentState>) => MainCompmonentState,
    callback: () => void
  ) => void;
}

export function frame(
  gameState: GameState,
  deps: GameDependencies,
  mainState: MainStateFunctions
): (time: DOMHighResTimeStamp) => void {
  return (time) => {
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

    deps.network.update(gameState);
    deps.mouseUpdater.update(time);

    const mouseState = { ...deps.mouseUpdater.state };
    deps.mouseUpdater.state.clicks = [];

    deps.tileGrid.update(gameState, mouseState);
    deps.gameLogic.update(gameState);
    deps.fireworkUpdater.update(gameState, mouseState);
    deps.sounds.update(gameState);

    deps.tileGrid.draw(deps.context, gameState, mouseState);
    deps.fireworks.updateAndDraw(deps.context);

    deps.context.restore();

    syncReactAndGameState(mainState, gameState, () =>
      requestAnimationFrame(frame(gameState, deps, mainState))
    );
  }
}
