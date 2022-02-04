import { Rect, rectContains } from "./domain";
import { TileGraphics } from "./TileGraphics";
import { fromJS, is, Map } from "immutable";
import { GameState } from "./GameState";
import { IGameStateUpdater } from "~/IGameStateUpdater";
import { Position } from "../../../shared/Domain";

export const PANEL_HEIGHT = 129;
const PADDING = 5;
const OFFSET = 25;

export class PanelGraphics implements IGameStateUpdater {
  private position: Position = { x: 0, y: 0 };
  private tileRects: Map<number, Rect>;

  constructor(private tileGraphics: TileGraphics) {
    this.tileRects = this.computeTileRects();
  }

  private computeTileRects(): Map<number, Rect> {
    const tileY = this.position.y + this.tileGraphics.tileHeight / 2;

    const startTileX = this.position.x + OFFSET + PADDING;

    return Map<number, Rect>(
      [0, 1, 2, 3, 4, 5].map((_, i) => {
        const tileX =
          startTileX + i * this.tileGraphics.tileWidth + i * PADDING;
        const tilePosition = { x: tileX, y: tileY };
        return [
          i,
          {
            position: tilePosition,
            width: this.tileGraphics.tileWidth,
            height: this.tileGraphics.tileHeight,
          },
        ];
      })
    );
  }

  update(gameState: GameState): void {
    if (
      !is(fromJS(this.position), fromJS(gameState.bottomPanelBounds.position))
    ) {
      this.position = gameState.bottomPanelBounds.position;
      this.tileRects = this.computeTileRects();
    }

    gameState.panelHoverTileIndex = undefined;

    if (gameState.userInControl === gameState.currentUser.userId) {
      this.tileRects.forEach((rect, i) => {
        if (
          i < gameState.hand.size &&
          rectContains(rect, gameState.mousePosition)
        ) {
          gameState.panelHoverTileIndex = i;
          return false;
        }
      });
    }

    gameState.mouseEvents.forEach((e) => {
      if (e.type == "MouseClick") {
        this.tileRects.forEach((rect, i) => {
          if (i < gameState.hand.size && rectContains(rect, e.position)) {
            if (gameState.panelActiveTileIndicies.has(i)) {
              gameState.panelActiveTileIndicies.delete(i);
            } else {
              gameState.panelActiveTileIndicies.add(i);
            }
            return false;
          }
        });
      }
    });
  }

  draw(context: CanvasRenderingContext2D, state: GameState): void {
    state.hand.map((tile, i) => {
      const rect = this.tileRects.get(i);
      if (rect) {
        if (state.panelActiveTileIndicies.has(i)) {
          this.tileGraphics.drawActiveTile(context, rect.position, tile);
        } else if (
          state.panelHoverTileIndex != undefined &&
          state.panelHoverTileIndex === i
        ) {
          this.tileGraphics.drawHoverTile(context, rect.position, tile);
        } else {
          this.tileGraphics.drawInactiveTile(context, rect.position, tile);
        }
      }
    });
  }
}
