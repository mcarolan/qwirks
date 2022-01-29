import { Position, Rect, Tile } from "./domain";
import { TileGraphics } from "./TileGraphics";
import { loadImage } from "./utility";
import { is, List, Map } from "immutable";
import { GameState } from "./GameState";
import { IGameStateUpdater } from "~/IGameStateUpdater";

const panelStartImage = loadImage("./images/panel-start.png");
const PANEL_START_IMAGE_WIDTH = 26;
export const PANEL_HEIGHT = 129;
const PANEL_END_IMAGE_WIDTH = 26;
const PANEL_ITEMS = 6;
const PADDING = 5;

export class PanelGraphics implements IGameStateUpdater {
  private position: Position = Position.ZERO;

  private newPosition(state: GameState) {
    return state.bottomPanelBounds.position;
  }

  private tileRects(state: GameState): Map<number, Rect> {
    const tileY =
      this.position.y +
      panelStartImage.height / 2 -
      TileGraphics.tileHeight / 2;

    const startTileX = this.position.x + panelStartImage.width + PADDING;

    return Map<number, Rect>(
      state.hand.map((_, i) => {
        const tileX = startTileX + i * TileGraphics.tileWidth + i * PADDING;
        const tilePosition = new Position(tileX, tileY);
        return [
          i,
          new Rect(
            tilePosition,
            TileGraphics.tileWidth,
            TileGraphics.tileHeight
          ),
        ];
      })
    );
  }

  update(gameState: GameState): GameState {
    this.position = this.newPosition(gameState);
    const tileRects = this.tileRects(gameState);

    var newHover: number | undefined;

    const mousePosition = gameState.mousePosition;
    if (mousePosition) {
      tileRects.forEach((rect, i) => {
        if (rect.contains(mousePosition)) {
          newHover = i;
          return false;
        }
      });
    }

    var activePanel = gameState.panelActiveTileIndicies;

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
          if (rect.contains(e.position)) {
            setActivePanel(i, !gameState.panelActiveTileIndicies.contains(i));
            return false;
          }
        });
      }
    });

    return {
      ...gameState,
      panelHoverTileIndex: newHover,
      panelActiveTileIndicies: activePanel,
    };
  }

  draw(context: CanvasRenderingContext2D, state: GameState): void {
    // this.drawPanel(context);
    const tileRects = this.tileRects(state);

    state.hand.map((tile, i) => {
      const rect = tileRects.get(i);
      if (rect) {
        if (state.panelActiveTileIndicies.contains(i)) {
          TileGraphics.drawActiveTile(context, rect.position, tile);
        } else if (
          state.panelHoverTileIndex != undefined &&
          is(state.panelHoverTileIndex, i)
        ) {
          TileGraphics.drawHoverTile(context, rect.position, tile);
        } else {
          TileGraphics.drawInactiveTile(context, rect.position, tile);
        }
      }
    });
  }
}
