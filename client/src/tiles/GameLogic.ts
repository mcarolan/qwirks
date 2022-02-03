import { GameState } from "./GameState";
import { Set, Map } from "immutable";
import { ButtonTag } from "../index";
import { IGameStateUpdater } from "~/IGameStateUpdater";
import { PositionedTile, prettyPrint, Tile } from "../../../shared/Domain";
import { TileGrid } from "../../../shared/TileGrid";

function isValidPlacement(
  gameState: GameState,
  placements: PositionedTile[]
): boolean {
  console.log(gameState.tilesApplied);
  console.log(`placements ${JSON.stringify(placements)}`);
  const newTg = new TileGrid(gameState.tilesApplied).place(Set(placements));

  if (newTg) {
    switch (newTg.type) {
      case "Success":
        gameState.currentPlacement.tiles = newTg.tileGrid.tiles;
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

function buildSet<T>(map: Map<T, boolean>): Set<T> {
  return map
    .filter((v) => v)
    .keySeq()
    .toSet();
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
          const newPlacement = gameState.currentPlacement.tiles.concat(
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

    if (gameState.pressedButtonTags.contains(ButtonTag.Accept)) {
      gameState.scoreJustAchieved = gameState.currentPlacement.score;
      gameState.fireworkTilePositions = gameState.currentPlacement.lines
        .flatMap((line) => line.map((pt) => pt.position))
        .toList();
      gameState.currentPlacement.score = 0;
      gameState.tilesToApply = gameState.currentPlacement.tiles;
      gameState.currentPlacement.tiles = [];
      gameState.userInControl = undefined;
    } else if (
      gameState.pressedButtonTags.contains(ButtonTag.Swap) &&
      !gameState.panelActiveTileIndicies.isEmpty()
    ) {
      const tiles = gameState.panelActiveTileIndicies.flatMap((i) => {
        const t = gameState.hand.get(i);

        if (t) {
          return Set.of(t);
        } else {
          return Set<Tile>();
        }
      });
      gameState.tilesToSwap = tiles.toArray();
      gameState.panelActiveTileIndicies = Set.of();
      gameState.userInControl = undefined;
    } else if (
      gameState.pressedButtonTags.contains(ButtonTag.Cancel) &&
      !(gameState.currentPlacement.tiles.length === 0)
    ) {
      const newHand = gameState.hand.concat(
        gameState.currentPlacement.tiles.map((p) => p.tile)
      );
      gameState.hand = newHand;
      gameState.currentPlacement.tiles = [];
    }

    const placementButtonsEnabled = !(
      gameState.currentPlacement.tiles.length === 0
    );
    const cancelButtonEnabled =
      !gameState.panelActiveTileIndicies.isEmpty() &&
      gameState.currentPlacement.tiles.length === 0;

    const startButtonEnabled =
      !gameState.isStarted && gameState.userList.size > 1;

    gameState.enabledButtonTags = buildSet(
      Map([
        [ButtonTag.Accept, placementButtonsEnabled],
        [ButtonTag.Cancel, placementButtonsEnabled],
        [ButtonTag.Swap, cancelButtonEnabled],
        [ButtonTag.Start, startButtonEnabled],
      ])
    );

    gameState.visibleButtonTags = buildSet(
      Map([
        [ButtonTag.Accept, gameState.isStarted],
        [ButtonTag.Cancel, gameState.isStarted],
        [ButtonTag.Swap, gameState.isStarted],
        [ButtonTag.Start, !gameState.isStarted],
      ])
    );

    gameState.tilesToDisplay =
      gameState.currentPlacement.tiles.length === 0
        ? gameState.tilesApplied
        : gameState.tilesApplied.concat(gameState.currentPlacement.tiles);

    return gameState;
  }
}
