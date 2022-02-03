import { Rect, rectContains } from "./domain";
import { TileGraphics } from "./TileGraphics";
import { is, Map } from "immutable";
import { GameState } from "./GameState";
import { IGameStateUpdater } from "~/IGameStateUpdater";
import { ORIGIN, Position, Tile } from "../../../shared/Domain";

export const PANEL_HEIGHT = 129;
const PADDING = 5;
const OFFSET = 25;

export class PanelGraphics implements IGameStateUpdater {
  private position: Position = ORIGIN;

  constructor(private tileGraphics: TileGraphics) {}

  private newPosition(state: GameState) {
    return state.bottomPanelBounds.position;
  }

  private tileRects(state: GameState): Map<number, Rect> {
    const tileY = this.position.y + this.tileGraphics.tileHeight / 2;

    const startTileX = this.position.x + OFFSET + PADDING;

    return Map<number, Rect>(
      state.hand.map((_, i) => {
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

  update(gameState: GameState): GameState {
    this.position = this.newPosition(gameState);
    const tileRects = this.tileRects(gameState);

    var newHover: number | undefined;
    var activePanel = gameState.panelActiveTileIndicies;

    if (gameState.userInControl === gameState.currentUser.userId) {
      const mousePosition = gameState.mousePosition;
      if (mousePosition) {
        tileRects.forEach((rect, i) => {
          if (rectContains(rect, mousePosition)) {
            newHover = i;
            return false;
          }
        });
      }

      function setActivePanel(index: number, active: boolean): void {
        if (active) {
          activePanel = activePanel.add(index);
        } else {
          activePanel = activePanel.remove(index);
        }
      }

      gameState.mouseEvents.forEach((e) => {
        if (e.type == "MouseClick") {
          tileRects.forEach((rect, i) => {
            if (rectContains(rect, e.position)) {
              setActivePanel(i, !gameState.panelActiveTileIndicies.contains(i));
              return false;
            }
          });
        }
      });
    }

    return {
      ...gameState,
      panelHoverTileIndex: newHover,
      panelActiveTileIndicies: activePanel,
    };
  }

  draw(context: CanvasRenderingContext2D, state: GameState): void {
    const tileRects = this.tileRects(state);

    state.hand.map((tile, i) => {
      const rect = tileRects.get(i);
      if (rect) {
        if (state.panelActiveTileIndicies.contains(i)) {
          this.tileGraphics.drawActiveTile(context, rect.position, tile);
        } else if (
          state.panelHoverTileIndex != undefined &&
          is(state.panelHoverTileIndex, i)
        ) {
          this.tileGraphics.drawHoverTile(context, rect.position, tile);
        } else {
          this.tileGraphics.drawInactiveTile(context, rect.position, tile);
        }
      }
    });
  }
}
