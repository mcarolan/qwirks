import { GameDependencies } from "./GameDependencies";
import {
  MainCompmonentState,
  syncReactAndGameState,
} from "../state/MainComponentState";
import { middle, rectFromElement } from "../graphics/domain";
import { GameState } from "~/state/GameState";
import { MouseUpdater, registerMouseUpdater } from "./Mouse";
import { mul } from "../../../shared/Domain";

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
    deps.network.update(gameState);
    gameState.mainAreaBounds = rectFromElement(deps.mainArea);

    if (gameState.isStarted && !deps.mouseUpdater) {
      deps.mouseUpdater = new MouseUpdater(mul(middle(gameState.mainAreaBounds), -1));
      registerMouseUpdater(deps.mouseUpdater);
    }

    deps.context.save();
    deps.canvas.width = gameState.mainAreaBounds.width;
    deps.canvas.height = gameState.mainAreaBounds.height;
    deps.context.clearRect(
      0,
      0,
      deps.context.canvas.width,
      deps.context.canvas.height
    );

    const mouseUpdater = deps.mouseUpdater;
    if (mouseUpdater) {
      mouseUpdater.update(time);
      const mouseState = { ...mouseUpdater.state };

      deps.tileGrid.update(gameState, mouseState);
      deps.fireworkUpdater.update(gameState, mouseState);
      deps.tileGrid.draw(deps.context, gameState, mouseState);
      mouseUpdater.state.clicks = [];
    }

    deps.gameLogic.update(gameState);
    deps.sounds.update(gameState);

    deps.fireworks.updateAndDraw(deps.context);

    deps.context.restore();

    syncReactAndGameState(mainState, gameState, () =>
      requestAnimationFrame(frame(gameState, deps, mainState))
    );
  }
}
