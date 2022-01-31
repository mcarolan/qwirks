import { GameState } from "./tiles/GameState";

export interface IGameStateUpdater {
  update(gameState: GameState): GameState;
}
