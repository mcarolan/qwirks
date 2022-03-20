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

  syncReactAndGameState(mainState, gameState, () =>
    requestAnimationFrame((_) => frame(gameState, deps, mainState))
  );
}
