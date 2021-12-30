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

const canvasRect = new Rect(new Position(0, 0), canvas.width, canvas.height);

const tileGridRect = new Rect(
  new Position(10, 10),
  canvasRect.width,
  canvasRect.height - PANEL_HEIGHT - 10
);

var mid = canvasRect.middle();

var mousePosition: Position | undefined;
var mouseDown: number | undefined;

var panel: PanelGraphics | undefined;

function isMouseDown(): boolean {
  return mouseDown != undefined && mouseDown != 0;
}

var isDragging: boolean = false;
var mouseDragStart: Position | undefined;
var isMouseDragComplete = false;

var tg: TileGrid | undefined = undefined;

const tgRes = TileGrid.empty().place(
  Set.of(
    new PositionedTile(
      new Tile(TileColour.Blue, TileShape.Four),
      new Position(0, 0)
    )
  )
);

if (tgRes.type == "Success") {
  tg = tgRes.tileGrid;
}

function updateMousePosition(mouseEvent: MouseEvent): any {
  mousePosition = new Position(mouseEvent.pageX, mouseEvent.pageY);

  if (isMouseDown() && mouseDragStart && mousePosition && !isDragging) {
    const dx = Math.abs(mouseDragStart.x - mousePosition.x);
    const dy = Math.abs(mouseDragStart.y - mousePosition.y);

    if (dx > 5 || dy > 5) {
      isDragging = true;
    }
  }
}

function updateMouseDown(mouseEvent: MouseEvent): any {
  const downBefore = isMouseDown();
  mouseDown = (mouseDown ?? 0) + 1;
  if (!downBefore && isMouseDown() && mouseDragStart == undefined) {
    mouseDragStart = mousePosition;
  }
}

function updateMouseUp(mouseEvent: MouseEvent): any {
  const downBefore = isMouseDown();
  mouseDown = (mouseDown ?? 0) - 1;
  if (isDragging && downBefore && !isMouseDown()) {
    isMouseDragComplete = true;
    isDragging = false;
  }
}

document.addEventListener("mousedown", updateMouseDown);
document.addEventListener("mouseup", updateMouseUp);
document.addEventListener("mousemove", updateMousePosition);

var [hand, tileBag] = TileBag.full().take(6);

function doPlacement(placements: Set<PositionedTile>): boolean {
  const newTg = tg?.place(placements);

  if (newTg) {
    switch (newTg.type) {
      case "Success":
        tg = newTg.tileGrid;
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

  if (!panel) {
    panel = new PanelGraphics(canvasRect, hand, undefined, undefined);
  }
  panel = panel.nextPanel(canvasRect, mousePosition, isMouseDown());

  var draggingOffset = new Position(0, 0);

  if (isDragging && mouseDragStart && mousePosition) {
    const dx = mouseDragStart.x - mousePosition.x;
    const dy = mouseDragStart.y - mousePosition.y;
    draggingOffset = new Position(dx, dy);
  } else if (isMouseDragComplete && mouseDragStart && mousePosition) {
    const dx = mouseDragStart.x - mousePosition.x;
    const dy = mouseDragStart.y - mousePosition.y;
    mid = new Position(mid.x - dx, mid.y - dy);
    draggingOffset = new Position(0, 0);
    isMouseDragComplete = false;
    mouseDragStart = undefined;
  }

  const effectiveMid = new Position(
    mid.x - draggingOffset.x,
    mid.y - draggingOffset.y
  );

  if (
    isMouseDown() &&
    mousePosition &&
    tileGridRect.contains(mousePosition) &&
    panel.active != undefined &&
    panel.activeTile
  ) {
    const xy = TileGraphics.positionFromScreen(mousePosition, effectiveMid);
    if (doPlacement(Set.of(new PositionedTile(panel.activeTile, xy)))) {
      const [took, newTg] = tileBag.take(1);
      tileBag = newTg;
      const newHand = panel.hand.remove(panel.active).concat(took);
      panel = panel.clearActiveAndSetHand(newHand);
    }
  }

  panel.draw(context);
  if (tg) {
    TileGridGraphics.draw(context, effectiveMid, tg);
  }

  requestAnimationFrame(() => gameLoop(context));
}

gameLoop(context);
