import { IGameStateUpdater } from "~/IGameStateUpdater";
import { Position } from "./domain";
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
  private mousePosition: Position | undefined;
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

      const currentPos = mouse.mousePosition;

      if (
        mouse.isDragging &&
        currentPos &&
        mouse.mouseDragStart &&
        downBefore &&
        !mouse.isMouseDown()
      ) {
        mouse.isDragging = false;
        const e: MouseDrag = {
          type: "MouseDrag",
          from: mouse.mouseDragStart,
          to: currentPos,
        };
        mouse.events.push(e);
        mouse.mouseDragStart = undefined;
      } else if (currentPos && downBefore && !mouse.isMouseDown()) {
        const e: MouseClick = {
          type: "MouseClick",
          position: currentPos,
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
        mouse.mouseDragStart = mouse.mousePosition;
      }
    };
  }

  static updateMousePosition(mouse: Mouse): (e: MouseEvent) => void {
    return (e) => {
      mouse.mousePosition = new Position(e.pageX, e.pageY);

      if (
        mouse.isMouseDown() &&
        mouse.mouseDragStart &&
        mouse.mousePosition &&
        !mouse.isDragging
      ) {
        const dx = Math.abs(mouse.mouseDragStart.x - mouse.mousePosition.x);
        const dy = Math.abs(mouse.mouseDragStart.y - mouse.mousePosition.y);

        if (dx > 5 || dy > 5) {
          mouse.isDragging = true;
        }
      }
    };
  }

  update(gameState: GameState): GameState {
    var drag: MouseDrag | undefined;

    if (this.isDragging && gameState.mousePosition && this.mouseDragStart) {
      const e: MouseDrag = {
        type: "MouseDrag",
        from: this.mouseDragStart,
        to: this.mousePosition ?? gameState.mousePosition,
      };
      drag = e;
    } else {
      drag = undefined;
    }

    const res = {
      ...gameState,
      mousePosition: this.mousePosition,
      mouseEvents: this.events,
      mouseDragInProgress: drag,
    };
    this.events = [];
    return res;
  }
}
