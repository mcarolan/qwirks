import { PositionedTile, prettyPrint } from "./domain";
import { GameState } from "./GameState";
import { Set } from "immutable";

function doPlacement(
  gameState: GameState,
  placements: Set<PositionedTile>
): boolean {
  const newTg = gameState.tileGrid.place(placements);

  if (newTg) {
    switch (newTg.type) {
      case "Success":
        gameState.tileGrid = newTg.tileGrid;
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
          if (
            doPlacement(gameState, Set.of(new PositionedTile(activeTile, p)))
          ) {
            const [took, newTg] = gameState.tileBag.take(1);
            gameState.tileBag = newTg;
            const newHand = gameState.hand.remove(activeTileIndex).concat(took);
            gameState.panelActiveTileIndex = undefined;
            gameState.hand = newHand;
          }
        });
      }
    }
  }
}
