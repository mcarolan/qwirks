import { IGameStateUpdater } from "~/game/IGameStateUpdater";
import { Position } from "../../../shared/Domain";
import { capScale, GameState } from "../state/GameState";

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
  private primaryMouseButtonDown = false;

  private isDragging: boolean = false;
  private mouseDragStart: Position | undefined;

  private events = Array<MouseClickOrDrag>();

  private wheelDelta: number = 0;

  private setPrimaryMouseButtonDown(e: MouseEvent): void {
    const flags = e.buttons !== undefined ? e.buttons : e.which;
    const downBefore = this.primaryMouseButtonDown;
    this.primaryMouseButtonDown = (flags & 1) === 1;

    if (
      this.primaryMouseButtonDown &&
      this.mouseDragStart &&
      !this.isDragging
    ) {
      const dx = Math.abs(this.mouseDragStart.x - this.mousePosition.x);
      const dy = Math.abs(this.mouseDragStart.y - this.mousePosition.y);

      if (dx > 5 || dy > 5) {
        this.isDragging = true;
      }
    } else if (
      this.isDragging &&
      this.mouseDragStart &&
      downBefore &&
      !this.primaryMouseButtonDown
    ) {
      this.isDragging = false;
      const e: MouseDrag = {
        type: "MouseDrag",
        from: this.mouseDragStart,
        to: { x: this.mousePosition.x, y: this.mousePosition.y },
      };
      this.events.push(e);
      this.mouseDragStart = undefined;
    } else if (
      !downBefore &&
      this.primaryMouseButtonDown &&
      this.mousePosition &&
      this.mouseDragStart === undefined
    ) {
      this.mouseDragStart = {
        x: this.mousePosition.x,
        y: this.mousePosition.y,
      };
    } else if (downBefore && !this.primaryMouseButtonDown) {
      const e: MouseClick = {
        type: "MouseClick",
        position: { x: this.mousePosition.x, y: this.mousePosition.y },
      };
      this.mouseDragStart = undefined;
      this.events.push(e);
    }
  }

  static updateMouseWheel(mouse: Mouse): (e: WheelEvent) => void {
    return (e: WheelEvent) => {
      e.preventDefault();
      mouse.wheelDelta += e.deltaY;
    };
  }

  static updateMouseUp(mouse: Mouse): (e: MouseEvent) => void {
    return (e: MouseEvent) => {
      mouse.setPrimaryMouseButtonDown(e);
    };
  }

  static updateMouseDown(mouse: Mouse): (e: MouseEvent) => void {
    return (e: MouseEvent) => {
      mouse.setPrimaryMouseButtonDown(e);
    };
  }

  static updateMousePosition(mouse: Mouse): (e: MouseEvent) => void {
    return (e) => {
      mouse.mousePosition.x = e.pageX;
      mouse.mousePosition.y = e.pageY;

      mouse.setPrimaryMouseButtonDown(e);
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

    gameState.scale = capScale(gameState.scale + this.wheelDelta * 0.001);
    this.wheelDelta = 0;

    this.events = [];
  }
}
