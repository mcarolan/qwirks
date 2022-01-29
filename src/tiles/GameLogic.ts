import { PositionedTile, prettyPrint } from "./domain";
import { GameState } from "./GameState";
import { Set } from "immutable";
import { ButtonTags } from "../index";
import { IGameStateUpdater } from "~/IGameStateUpdater";

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

export class GameLogic implements IGameStateUpdater {
  update(oldState: GameState): GameState {
    const gameState: GameState = { ...oldState };
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

    if (gameState.pressedButtonTags.contains(ButtonTags.Accept)) {
      gameState.tileGridApplied = gameState.currentPlacement.tileGrid;

      const toTake = gameState.currentPlacement.tiles.size;

      const [toAdd, newBag] = gameState.tileBag.take(toTake);
      gameState.hand = gameState.hand.concat(toAdd);
      gameState.tileBag = newBag;
      gameState.score = gameState.score + gameState.currentPlacement.score;
      gameState.scoreJustAchieved = gameState.currentPlacement.score;

      gameState.fireworkTilePositions = gameState.currentPlacement.lines
        .flatMap((line) => line.map((pt) => pt.position))
        .toList();

      gameState.currentPlacement.score = 0;
      gameState.currentPlacement.tiles = Set.of();
    } else if (
      gameState.pressedButtonTags.contains(ButtonTags.Swap) &&
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
      gameState.pressedButtonTags.contains(ButtonTags.Cancel) &&
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
    var buttonsEnabled = gameState.enabledButtonTags;

    function setButtonEnabled(tag: string, isPressed: boolean) {
      if (isPressed) {
        buttonsEnabled = buttonsEnabled.add(tag);
      } else {
        buttonsEnabled = buttonsEnabled.remove(tag);
      }
    }

    setButtonEnabled(ButtonTags.Accept, placementButtonsEnabled);
    setButtonEnabled(ButtonTags.Cancel, placementButtonsEnabled);
    setButtonEnabled(
      ButtonTags.Swap,
      !gameState.panelActiveTileIndicies.isEmpty() &&
        gameState.currentPlacement.tiles.isEmpty()
    );
    gameState.enabledButtonTags = buttonsEnabled;

    gameState.tileGridToDisplay = gameState.currentPlacement.tiles.isEmpty()
      ? gameState.tileGridApplied
      : gameState.currentPlacement.tileGrid;

    return gameState;
  }
}
