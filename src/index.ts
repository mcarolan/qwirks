import { Rect } from "./tiles/domain";

import _ from "lodash";
import { Position } from "./tiles/domain";
import { PanelGraphics, PANEL_HEIGHT } from "./tiles/PanelGraphics";
import { TileGridGraphics } from "./tiles/TileGridGraphics";
import { GameState } from "./tiles/GameState";
import { Mouse } from "./tiles/Mouse";
import { GameLogic } from "./tiles/GameLogic";
import { loadImage } from "./tiles/utility";
import { Button } from "./tiles/Button";
import { Score } from "./tiles/Score";

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

const acceptInactive = loadImage("./images/accept-inactive.png");
const acceptHover = loadImage("./images/accept-hover.png");

const swapInactive = loadImage("./images/swap-inactive.png");
const swapHover = loadImage("./images/swap-hover.png");

const cancelInactive = loadImage("./images/cancel-inactive.png");
const cancelHover = loadImage("./images/cancel-hover.png");

export const acceptButton = new Button(
  new Position(canvasRect.width - acceptInactive.width - 10, 10),
  acceptInactive,
  acceptHover,
  "accept"
);

export const swapButton = new Button(
  acceptButton.position.plus(new Position(0, acceptInactive.height + 10)),
  swapInactive,
  swapHover,
  "swap"
);

export const cancelButton = new Button(
  swapButton.position.plus(new Position(0, swapInactive.height + 10)),
  cancelInactive,
  cancelHover,
  "cancel"
);

const score: Score = new Score(new Position(10, 10));

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
  acceptButton.updateGameState(gameState);
  swapButton.updateGameState(gameState);
  cancelButton.updateGameState(gameState);
  GameLogic.updateGameState(gameState);

  tileGrid.draw(context, gameState);
  panel.draw(context, gameState);
  acceptButton.draw(context, gameState);
  swapButton.draw(context, gameState);
  cancelButton.draw(context, gameState);
  score.draw(context, gameState);

  requestAnimationFrame(() => gameLoop(context));
}

gameLoop(context);
