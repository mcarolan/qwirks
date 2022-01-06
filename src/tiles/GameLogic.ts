import { PositionedTile, prettyPrint } from "./domain";
import { GameState } from "./GameState";
import { Set } from "immutable";

function isValidPlacement(
  gameState: GameState,
  placements: Set<PositionedTile>
): boolean {
  const newTg = gameState.tileGridApplied.place(placements);

  if (newTg) {
    switch (newTg.type) {
      case "Success":
        gameState.tileGridInProgress = newTg.tileGrid;
        return true;
      default:
        console.log(`oh no, can't do that: ${prettyPrint(newTg)}`);
        break;
    }
  } else {
    console.log("newTg or tileGridGraphics is null");
  }
  return false;
}

export class GameLogic {
  public static updateGameState(gameState: GameState): void {
    if (gameState.panelActiveTileIndex) {
      const activeTileIndex = gameState.panelActiveTileIndex;
      const activeTile = gameState.hand.get(gameState.panelActiveTileIndex);
      if (activeTile) {
        gameState.tilePositionsPressed.forEach((p) => {
          const newPlacement = gameState.currentPlacementSet.add(
            new PositionedTile(activeTile, p)
          );
          if (isValidPlacement(gameState, newPlacement)) {
            const newHand = gameState.hand.remove(activeTileIndex);
            gameState.panelActiveTileIndex = undefined;
            gameState.hand = newHand;
            gameState.currentPlacementSet = newPlacement;
          }
        });

        gameState.tileGrid = gameState.currentPlacementSet.isEmpty()
          ? gameState.tileGridApplied
          : gameState.tileGridInProgress;
      }
    }
  }
}
