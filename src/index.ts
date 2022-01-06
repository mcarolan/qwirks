import { Rect } from "./tiles/domain";

import _ from "lodash";
import { Position } from "./tiles/domain";
import { PanelGraphics, PANEL_HEIGHT } from "./tiles/PanelGraphics";
import { TileGridGraphics } from "./tiles/TileGridGraphics";
import { GameState } from "./tiles/GameState";
import { Mouse } from "./tiles/Mouse";
import { GameLogic } from "./tiles/GameLogic";

const canvas = document.querySelector("#game") as HTMLCanvasElement;
const context = canvas.getContext("2d") as CanvasRenderingContext2D;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const canvasRect = new Rect(new Position(0, 0), canvas.width, canvas.height);

const gameState: GameState = GameState.initial(canvasRect);

const tileGridRect = new Rect(
  new Position(10, 10),
  canvasRect.width,
  canvasRect.height - PANEL_HEIGHT - 10
);

var panel: PanelGraphics | undefined;

var tileGrid: TileGridGraphics | undefined;

const mouse: Mouse = new Mouse();

document.addEventListener("mousedown", Mouse.updateMouseDown(mouse));
document.addEventListener("mouseup", Mouse.updateMouseUp(mouse));
document.addEventListener("mousemove", Mouse.updateMousePosition(mouse));

function gameLoop(context: CanvasRenderingContext2D) {
  context.fillStyle = "red";
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  if (!panel) {
    panel = new PanelGraphics(gameState);
  }
  if (!tileGrid) {
    tileGrid = new TileGridGraphics(tileGridRect);
  }

  mouse.updateGameState(gameState);
  panel.updateGameState(gameState);
  tileGrid.updateGameState(gameState);
  GameLogic.updateGameState(gameState);

  panel.draw(context, gameState);
  tileGrid.draw(context, gameState);

  requestAnimationFrame(() => gameLoop(context));
}

gameLoop(context);
