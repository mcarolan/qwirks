import { Position, PositionedTile, prettyPrint, Rect, Tile } from "./domain";
import { GameState } from "./GameState";
import { MouseDrag } from "./Mouse";
import { TileGraphics } from "./TileGraphics";
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

export class TileGridGraphics {
  private mid: Position;
  private effectiveMid: Position;

  constructor(readonly tileGridRect: Rect) {
    this.mid = tileGridRect.middle();
    this.effectiveMid = tileGridRect.middle();
  }

  private updateDragging(gameState: GameState): void {
    const delta = (e: MouseDrag) => e.from.minus(e.to);
    gameState.mouseEvents.forEach((e) => {
      if (e.type == "MouseDrag") {
        this.mid = this.mid.minus(delta(e));
      }
    });

    this.effectiveMid = this.mid;

    if (gameState.mouseDragInProgress) {
      this.effectiveMid = this.mid.minus(delta(gameState.mouseDragInProgress));
    }
  }

  private updatePlacements(gameState: GameState): void {
    gameState.mouseEvents.forEach((e) => {
      if (e.type == "MouseClick") {
        if (
          this.tileGridRect.contains(e.position) &&
          gameState.panelActiveTileIndex != undefined
        ) {
          const xy = TileGraphics.positionFromScreen(
            e.position,
            this.effectiveMid
          );
          const activeTile = gameState.hand.get(gameState.panelActiveTileIndex);
          if (
            activeTile &&
            doPlacement(gameState, Set.of(new PositionedTile(activeTile, xy)))
          ) {
            const [took, newTg] = gameState.tileBag.take(1);
            gameState.tileBag = newTg;
            const newHand = gameState.hand
              .remove(gameState.panelActiveTileIndex)
              .concat(took);
            gameState.panelActiveTileIndex = undefined;
            gameState.hand = newHand;
          }
        }
      }
    });
  }

  updateGameState(state: GameState): void {
    this.updateDragging(state);
    this.updatePlacements(state);
  }

  draw(context: CanvasRenderingContext2D, state: GameState): void {
    for (const pt of state.tileGrid.values) {
      const coords = TileGraphics.screenCoords(pt.position, this.effectiveMid);
      TileGraphics.drawInactiveTile(context, coords, pt.tile);
    }
  }
}
