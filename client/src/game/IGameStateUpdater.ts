import { GameState } from "~/state/GameState";

export interface IGameStateUpdater {
  update(gameState: GameState): void;
}
