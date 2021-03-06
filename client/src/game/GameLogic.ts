import { GameState, singleActiveTile } from "../state/GameState";
import { Set } from "immutable";
import { IGameStateUpdater } from "~/game/IGameStateUpdater";
import { PositionedTile, prettyPrint, Tile } from "../../../shared/Domain";
import { TileGrid } from "../../../shared/TileGrid";
import { ButtonTag } from "../component/Button";

function isValidPlacement(
  gameState: GameState,
  placements: Set<PositionedTile>
): boolean {
  const newTg = new TileGrid(gameState.tilesApplied).place(placements);

  if (newTg) {
    switch (newTg.type) {
      case "Success":
        gameState.currentPlacement.tiles = newTg.tileGrid.tiles;
        gameState.currentPlacement.score = newTg.score;
        gameState.currentPlacement.lines = newTg.lines;
        gameState.currentPlacement.placedTiles = placements;
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

function buildSet<T>(...entries: [T, boolean][]): Set<T> {
  return Set<T>().withMutations((m) => {
    entries.forEach(([v, b]) => {
      if (b) {
        m.add(v);
      }
    });
  });
}

export class GameLogic implements IGameStateUpdater {
  update(gameState: GameState): void {
    const singleActive = singleActiveTile(gameState);
    if (singleActive) {
      const [activeIndex, activeTile] = singleActive;
      gameState.tilePositionsPressed.forEach((p) => {
        const newPlacement = gameState.currentPlacement.placedTiles.add({
          ...activeTile,
          position: { x: p.x, y: p.y },
        });
        if (isValidPlacement(gameState, newPlacement)) {
          const newHand = gameState.hand.remove(activeIndex);
          gameState.panelActiveTileIndicies = Set();
          gameState.hand = newHand;
        }
      });
    }

    if (gameState.pressedButtonTags.contains(ButtonTag.Accept)) {
      gameState.scoreJustAchieved = gameState.currentPlacement.score;
      gameState.fireworkTilePositions = gameState.currentPlacement.lines
        .flatMap((line) => line.map((pt) => pt.position))
        .toList();
      gameState.currentPlacement.score = 0;
      gameState.tilesToApply = gameState.currentPlacement.placedTiles.toArray();
      gameState.currentPlacement.tiles = [];
      gameState.currentPlacement.placedTiles = Set();
      gameState.panelActiveTileIndicies = Set();
      gameState.userInControl = undefined;
    } else if (
      gameState.pressedButtonTags.contains(ButtonTag.Swap) &&
      !(gameState.panelActiveTileIndicies.size === 0)
    ) {
      const toSwap = new Array<Tile>();
      for (const ti of gameState.panelActiveTileIndicies) {
        const t = gameState.hand.get(ti);
        if (t) {
          toSwap.push(t);
        }
      }
      gameState.tilesToSwap = toSwap;
      gameState.panelActiveTileIndicies = Set();
      gameState.userInControl = undefined;
    } else if (
      gameState.pressedButtonTags.contains(ButtonTag.Cancel) &&
      !(gameState.currentPlacement.tiles.length === 0)
    ) {
      const newHand = gameState.hand.concat(
        gameState.currentPlacement.placedTiles
      );
      gameState.hand = newHand;
      gameState.currentPlacement.placedTiles = Set();
    }

    if (gameState.newUserInControl != undefined) {
      const newHand = gameState.hand.concat(
        gameState.currentPlacement.placedTiles
      );
      gameState.hand = newHand;
      gameState.currentPlacement.placedTiles = Set();
      gameState.currentPlacement.tiles = [];
      gameState.panelActiveTileIndicies = Set();
    }

    const placementButtonsEnabled = !(
      gameState.currentPlacement.tiles.length === 0
    );
    const cancelButtonEnabled =
      !(gameState.panelActiveTileIndicies.size === 0) &&
      gameState.currentPlacement.tiles.length === 0;

    const startButtonEnabled =
      !gameState.isStarted && gameState.userList.size > 1;

    gameState.enabledButtonTags = buildSet(
      [ButtonTag.Accept, placementButtonsEnabled],
      [ButtonTag.Cancel, placementButtonsEnabled],
      [ButtonTag.Swap, cancelButtonEnabled],
      [ButtonTag.Start, startButtonEnabled]
    );

    gameState.visibleButtonTags = buildSet(
      [ButtonTag.Accept, gameState.isStarted],
      [ButtonTag.Cancel, gameState.isStarted],
      [ButtonTag.Swap, gameState.isStarted],
      [ButtonTag.Start, !gameState.isStarted]
    );

    gameState.tilesToDisplay = gameState.currentPlacement.placedTiles.isEmpty()
      ? gameState.tilesApplied
      : gameState.currentPlacement.tiles;
  }
}
