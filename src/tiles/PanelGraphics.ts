import { Position, Rect, Tile } from "./domain";
import { TileGraphics } from "./TileGraphics";
import { loadImage } from "./utility";
import { is, List, Map } from "immutable";

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
  private tileRects: Map<number, Rect>;

  readonly position: Position;

  get activeTile(): Tile | undefined {
    if (this.active != undefined) {
      return this.hand.get(this.active, undefined);
    }
    return undefined;
  }

  constructor(
    readonly canvasRect: Rect,
    readonly hand: List<Tile> = List(),
    readonly hover: number | undefined,
    readonly active: number | undefined
  ) {
    this.position = new Position(
      canvasRect.width / 2 - PANEL_WIDTH / 2,
      canvasRect.height - PADDING - PANEL_HEIGHT
    );

    const tileY =
      this.position.y +
      panelStartImage.height / 2 -
      TileGraphics.tileHeight / 2;

    const startTileX = this.position.x + panelStartImage.width + PADDING;

    this.tileRects = Map<number, Rect>(
      hand.map((_, i) => {
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

  clearActiveAndSetHand(hand: List<Tile>): PanelGraphics {
    return new PanelGraphics(this.canvasRect, hand, undefined, undefined);
  }

  nextPanel(
    newCanvasRect: Rect,
    mousePosition: Position | undefined,
    isMouseDown: boolean
  ): PanelGraphics {
    var newHover: number | undefined;
    var newActive: number | undefined = this.active;

    if (mousePosition != undefined) {
      this.tileRects.forEach((rect, i) => {
        if (rect.contains(mousePosition)) {
          newHover = i;
          if (isMouseDown != undefined && isMouseDown) {
            newActive = i;
          }
          return false;
        }
      });
    }

    if (
      !is(this.canvasRect, newCanvasRect) ||
      !is(this.hover, newHover) ||
      !is(this.active, newActive)
    ) {
      return new PanelGraphics(newCanvasRect, this.hand, newHover, newActive);
    } else {
      return this;
    }
  }

  draw(context: CanvasRenderingContext2D): void {
    this.drawPanel(context);
    this.hand.map((tile, i) => {
      const rect = this.tileRects.get(i);
      if (rect) {
        if (this.active != undefined && is(this.active, i)) {
          TileGraphics.drawActiveTile(context, rect.position, tile);
        } else if (this.hover != undefined && is(this.hover, i)) {
          TileGraphics.drawHoverTile(context, rect.position, tile);
        } else {
          TileGraphics.drawInactiveTile(context, rect.position, tile);
        }
      }
    });
  }

  private drawPanel(context: CanvasRenderingContext2D): void {
    context.drawImage(
      panelStartImage,
      this.position.x,
      this.position.y - PADDING,
      PANEL_START_IMAGE_WIDTH,
      PANEL_HEIGHT
    );

    context.drawImage(
      panelEndImage,
      this.position.x + PANEL_WIDTH - PANEL_END_IMAGE_WIDTH,
      this.position.y - PADDING,
      PANEL_END_IMAGE_WIDTH,
      PANEL_HEIGHT
    );

    context.drawImage(
      panelRepaet,
      this.position.x + PANEL_START_IMAGE_WIDTH,
      this.position.y - PADDING,
      PANEL_REPEAT_IMAGE_WIDTH,
      PANEL_HEIGHT
    );
  }
}
