import { prettyPrint, Rect, Tile, TileColour, TileShape } from "./tiles/domain";

import _ from "lodash";
import { Position, PositionedTile } from "./tiles/domain";
import { TileGraphics } from "./tiles/TileGraphics";
import { PanelGraphics, PANEL_HEIGHT } from "./tiles/PanelGraphics";
import { List, Set } from "immutable";
import { TileGridGraphics } from "./tiles/TileGridGraphics";
import { TileGrid } from "./tiles/TileGrid";
import { TileBag } from "./tiles/TileBag";

const canvas = document.querySelector("#game") as HTMLCanvasElement;
const context = canvas.getContext("2d") as CanvasRenderingContext2D;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const offset = 3;
const padding = 3;

var center = new Position(0, 0);

var mousePosition: Position | undefined;
var mouseDown: number | undefined;

var panel: PanelGraphics | undefined;

function updateMousePosition(mouseEvent: MouseEvent): any {
  mousePosition = new Position(mouseEvent.pageX, mouseEvent.pageY);
}

function updateMouseDown(mouseEvent: MouseEvent): any {
  mouseDown = (mouseDown ?? 0) + 1;
}

function updateMouseUp(mouseEvent: MouseEvent): any {
  mouseDown = (mouseDown ?? 0) - 1;
}

document.addEventListener("mousedown", updateMouseDown);
document.addEventListener("mouseup", updateMouseUp);
document.addEventListener("mousemove", updateMousePosition);

var [hand, tileBag] = TileBag.full().take(6);

var tileGridGraphics: TileGridGraphics | undefined;

function doPlacement(placements: Set<PositionedTile>): boolean {
  const newTg = tileGridGraphics?.tilegrid.place(placements);

  if (newTg && tileGridGraphics) {
    switch (newTg.type) {
      case "Success":
        tileGridGraphics = new TileGridGraphics(
          newTg.tileGrid,
          tileGridGraphics.canvasRect
        );
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

function gameLoop(context: CanvasRenderingContext2D) {
  context.fillStyle = "red";
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  const canvasRect = new Rect(new Position(0, 0), canvas.width, canvas.height);

  const isMouseDown: boolean = mouseDown != undefined && mouseDown != 0;

  if (!panel) {
    panel = new PanelGraphics(canvasRect, hand, undefined, undefined);
  }
  panel = panel.nextPanel(canvasRect, mousePosition, isMouseDown);
  panel.draw(context);

  const tileGridRect = new Rect(
    new Position(10, 10),
    canvasRect.width,
    canvasRect.height - PANEL_HEIGHT - 10
  );

  if (
    isMouseDown &&
    mousePosition &&
    tileGridRect.contains(mousePosition) &&
    panel.active != undefined &&
    panel.activeTile
  ) {
    const xy = TileGraphics.positionFromScreen(
      mousePosition,
      tileGridRect.middle()
    );
    if (doPlacement(Set.of(new PositionedTile(panel.activeTile, xy)))) {
      const [took, newTg] = tileBag.take(1);
      tileBag = newTg;
      const newHand = panel.hand.remove(panel.active).concat(took);
      panel = panel.clearActiveAndSetHand(newHand);
    }
  }

  const tgRes = TileGrid.empty().place(
    Set.of(
      new PositionedTile(
        new Tile(TileColour.Blue, TileShape.Four),
        new Position(0, 0)
      )
    )
  );

  var tg: TileGrid | undefined = undefined;

  if (tgRes.type == "Success") {
    tg = tgRes.tileGrid;
  }

  if (!tileGridGraphics && tg) {
    tileGridGraphics = new TileGridGraphics(tg, tileGridRect);
  }

  if (tileGridGraphics) {
    tileGridGraphics = tileGridGraphics.nextPanel(tileGridRect);
    tileGridGraphics.draw(context);
  }

  requestAnimationFrame(() => gameLoop(context));
}

gameLoop(context);
