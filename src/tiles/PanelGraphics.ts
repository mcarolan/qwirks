import { Position, Rect, Tile } from "./domain";
import { TileGraphics } from "./TileGraphics";
import { loadImage } from "./utility";
import { is, List, Map } from "immutable";
import { GameState } from "./GameState";
import { LiteralUnion } from "prettier";

const panelStartImage = loadImage("./images/panel-start.png");
const PANEL_START_IMAGE_WIDTH = 26;
export const PANEL_HEIGHT = 129;
const PANEL_END_IMAGE_WIDTH = 26;
const PANEL_ITEMS = 6;
const PADDING = 5;
const panelEndImage = loadImage("./images/panel-end.png");
const panelRepaet = loadImage("./images/panel-repeat.png");

const PANEL_WIDTH =
  PANEL_START_IMAGE_WIDTH +
  PADDING +
  PANEL_ITEMS * TileGraphics.tileWidth +
  (PANEL_ITEMS - 1) * PADDING +
  PADDING +
  PANEL_END_IMAGE_WIDTH;

const PANEL_REPEAT_IMAGE_WIDTH =
  PANEL_WIDTH - PANEL_START_IMAGE_WIDTH - PANEL_END_IMAGE_WIDTH;

export class PanelGraphics {
  private position: Position;

  private newPosition(state: GameState) {
    return state.bottomPanelBounds.position;
  }

  constructor(state: GameState) {
    this.position = this.newPosition(state);
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

  updateGameState(state: GameState): void {
    this.position = this.newPosition(state);
    const tileRects = this.tileRects(state);

    var newHover: number | undefined;

    const mousePosition = state.mousePosition;
    if (mousePosition) {
      tileRects.forEach((rect, i) => {
        if (rect.contains(mousePosition)) {
          newHover = i;
          return false;
        }
      });
    }

    state.mouseEvents.forEach((e) => {
      if (e.type == "MouseClick") {
        tileRects.forEach((rect, i) => {
          if (rect.contains(e.position)) {
            state.setPanelTileActive(
              i,
              !state.panelActiveTileIndicies.contains(i)
            );
            return false;
          }
        });
      }
    });

    state.panelHoverTileIndex = newHover;
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

  private drawPanel(context: CanvasRenderingContext2D): void {
    const position = this.position;

    context.drawImage(
      panelStartImage,
      position.x,
      position.y - PADDING,
      PANEL_START_IMAGE_WIDTH,
      PANEL_HEIGHT
    );

    context.drawImage(
      panelEndImage,
      position.x + PANEL_WIDTH - PANEL_END_IMAGE_WIDTH,
      position.y - PADDING,
      PANEL_END_IMAGE_WIDTH,
      PANEL_HEIGHT
    );

    context.drawImage(
      panelRepaet,
      position.x + PANEL_START_IMAGE_WIDTH,
      position.y - PADDING,
      PANEL_REPEAT_IMAGE_WIDTH,
      PANEL_HEIGHT
    );
  }
}
