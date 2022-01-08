import { PositionedTile, prettyPrint } from "./domain";
import { GameState } from "./GameState";
import { Set } from "immutable";
import { acceptButton, cancelButton, swapButton } from "../index";

function isValidPlacement(
  gameState: GameState,
  placements: Set<PositionedTile>
): boolean {
  const newTg = gameState.tileGridApplied.place(placements);

  if (newTg) {
    switch (newTg.type) {
      case "Success":
        gameState.currentPlacement.tileGrid = newTg.tileGrid;
        gameState.currentPlacement.score = newTg.score;
        gameState.currentPlacement.lines = newTg.lines;
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
    const singleActiveTile:
      | number
      | undefined = gameState.panelActiveTileIndicies.first();
    if (singleActiveTile != undefined) {
      const activeTile = gameState.hand.get(singleActiveTile);
      if (activeTile) {
        gameState.tilePositionsPressed.forEach((p) => {
          const newPlacement = gameState.currentPlacement.tiles.add(
            new PositionedTile(activeTile, p)
          );
          if (isValidPlacement(gameState, newPlacement)) {
            const newHand = gameState.hand.remove(singleActiveTile);
            gameState.panelActiveTileIndicies = Set.of();
            gameState.hand = newHand;
            gameState.currentPlacement.tiles = newPlacement;
          }
        });
      }
    }

    if (gameState.pressedButtonTags.contains(acceptButton.tag)) {
      gameState.tileGridApplied = gameState.currentPlacement.tileGrid;

      const toTake = gameState.currentPlacement.tiles.size;

      const [toAdd, newBag] = gameState.tileBag.take(toTake);
      gameState.hand = gameState.hand.concat(toAdd);
      gameState.tileBag = newBag;
      gameState.score = gameState.score + gameState.currentPlacement.score;

      gameState.fireworkTilePositions = gameState.currentPlacement.lines
        .flatMap((line) => line.map((pt) => pt.position))
        .toList();

      gameState.currentPlacement.score = 0;
      gameState.currentPlacement.tiles = Set.of();
    } else if (
      gameState.pressedButtonTags.contains(swapButton.tag) &&
      !gameState.panelActiveTileIndicies.isEmpty()
    ) {
      const [toAdd, newBag] = gameState.tileBag.take(
        gameState.panelActiveTileIndicies.size
      );

      const newHand = gameState.hand
        .filterNot((_, i) => gameState.panelActiveTileIndicies.contains(i))
        .concat(toAdd);
      gameState.hand = newHand;
      gameState.tileBag = newBag;
      gameState.panelActiveTileIndicies = Set.of();
    } else if (
      gameState.pressedButtonTags.contains(cancelButton.tag) &&
      !gameState.currentPlacement.tiles.isEmpty()
    ) {
      const newHand = gameState.hand.concat(
        gameState.currentPlacement.tiles.map((p) => p.tile)
      );
      gameState.hand = newHand;
      gameState.currentPlacement.tileGrid = gameState.tileGridApplied;
      gameState.currentPlacement.tiles = Set.of();
    }

    const placementButtonsEnabled = !gameState.currentPlacement.tiles.isEmpty();

    gameState.setButtonEnabled(acceptButton.tag, placementButtonsEnabled);
    gameState.setButtonEnabled(cancelButton.tag, placementButtonsEnabled);
    gameState.setButtonEnabled(
      swapButton.tag,
      !gameState.panelActiveTileIndicies.isEmpty() &&
        gameState.currentPlacement.tiles.isEmpty()
    );

    gameState.tileGridToDisplay = gameState.currentPlacement.tiles.isEmpty()
      ? gameState.tileGridApplied
      : gameState.currentPlacement.tileGrid;
  }
}
