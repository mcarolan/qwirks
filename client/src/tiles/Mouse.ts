import { IGameStateUpdater } from "~/IGameStateUpdater";
import { Position } from "../../../shared/Domain";
import { GameState } from "./GameState";

export interface MouseClick {
  type: "MouseClick";
  position: Position;
}

export interface MouseDrag {
  type: "MouseDrag";
  from: Position;
  to: Position;
}

export type MouseClickOrDrag = MouseClick | MouseDrag;

export class Mouse implements IGameStateUpdater {
  private mousePosition: Position = { x: 0, y: 0 };
  private mouseDownCounter: number | undefined;

  private isDragging: boolean = false;
  private mouseDragStart: Position | undefined;

  private events = Array<MouseClickOrDrag>();

  private isMouseDown(): boolean {
    return this.mouseDownCounter != undefined && this.mouseDownCounter != 0;
  }

  static updateMouseUp(mouse: Mouse): () => void {
    return () => {
      const downBefore = mouse.isMouseDown();

      mouse.mouseDownCounter = (mouse.mouseDownCounter ?? 0) - 1;

      if (
        mouse.isDragging &&
        mouse.mouseDragStart &&
        downBefore &&
        !mouse.isMouseDown()
      ) {
        mouse.isDragging = false;
        const e: MouseDrag = {
          type: "MouseDrag",
          from: mouse.mouseDragStart,
          to: { x: mouse.mousePosition.x, y: mouse.mousePosition.y },
        };
        mouse.events.push(e);
        mouse.mouseDragStart = undefined;
      } else if (downBefore && !mouse.isMouseDown()) {
        const e: MouseClick = {
          type: "MouseClick",
          position: { x: mouse.mousePosition.x, y: mouse.mousePosition.y },
        };
        mouse.mouseDragStart = undefined;
        mouse.events.push(e);
      }
    };
  }

  static updateMouseDown(mouse: Mouse): () => void {
    return () => {
      const downBefore = mouse.isMouseDown();
      mouse.mouseDownCounter = (mouse.mouseDownCounter ?? 0) + 1;
      if (
        !downBefore &&
        mouse.isMouseDown() &&
        mouse.mousePosition &&
        mouse.mouseDragStart == undefined
      ) {
        mouse.mouseDragStart = {
          x: mouse.mousePosition.x,
          y: mouse.mousePosition.y,
        };
      }
    };
  }

  static updateMousePosition(mouse: Mouse): (e: MouseEvent) => void {
    return (e) => {
      mouse.mousePosition.x = e.pageX;
      mouse.mousePosition.y = e.pageY;

      if (mouse.isMouseDown() && mouse.mouseDragStart && !mouse.isDragging) {
        const dx = Math.abs(mouse.mouseDragStart.x - mouse.mousePosition.x);
        const dy = Math.abs(mouse.mouseDragStart.y - mouse.mousePosition.y);

        if (dx > 5 || dy > 5) {
          mouse.isDragging = true;
        }
      }
    };
  }

  update(gameState: GameState): void {
    var drag: MouseDrag | undefined;

    if (this.isDragging && this.mouseDragStart) {
      const e: MouseDrag = {
        type: "MouseDrag",
        from: this.mouseDragStart,
        to: gameState.mousePosition,
      };
      drag = e;
    }

    gameState.mousePosition = {
      x: this.mousePosition.x,
      y: this.mousePosition.y,
    };
    gameState.mouseEvents = this.events;
    gameState.mouseDragInProgress = drag;
    this.events = [];
  }
}
