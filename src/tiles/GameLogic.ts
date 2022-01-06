import { PositionedTile, prettyPrint } from "./domain";
import { GameState } from "./GameState";
import { Set } from "immutable";
import { acceptButton, swapButton } from "../index";

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
    if (gameState.panelActiveTileIndex != undefined) {
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
      }
    }

    if (gameState.pressedButtonTags.contains(acceptButton.tag)) {
      gameState.tileGridApplied = gameState.tileGridInProgress;

      const toTake = gameState.currentPlacementSet.size;

      const [toAdd, newBag] = gameState.tileBag.take(toTake);
      gameState.hand = gameState.hand.concat(toAdd);
      gameState.tileBag = newBag;

      gameState.currentPlacementSet = Set.of();
    } else if (
      gameState.pressedButtonTags.contains(swapButton.tag) &&
      gameState.panelActiveTileIndex != undefined
    ) {
      const [toAdd, newBag] = gameState.tileBag.take(1);
      const newHand = gameState.hand
        .remove(gameState.panelActiveTileIndex)
        .concat(toAdd);
      gameState.hand = newHand;
      gameState.tileBag = newBag;
      gameState.panelActiveTileIndex = undefined;
    }

    gameState.setButtonEnabled(
      acceptButton.tag,
      !gameState.currentPlacementSet.isEmpty()
    );
    gameState.setButtonEnabled(
      swapButton.tag,
      gameState.panelActiveTileIndex != undefined &&
        gameState.currentPlacementSet.isEmpty()
    );

    gameState.tileGrid = gameState.currentPlacementSet.isEmpty()
      ? gameState.tileGridApplied
      : gameState.tileGridInProgress;
  }
}
