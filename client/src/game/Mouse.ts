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

export interface MouseZoom {
  type: "MouseZoom";
  point: Position;
}

export type MouseEv = MouseClick | MouseDrag | MouseZoom;

export interface MouseGameState {
  mousePosition: Position;
  mouseEvents: MouseEv[];
  mouseDragInProgress: MouseDrag | undefined;
  scale: number;
}

export class Mouse implements IGameStateUpdater {
  private mousePosition: Position = { x: 0, y: 0 };
  private primaryMouseButtonDown = false;
  private twoFingerTouch = false;
  private touchPinchDiff: number = -1;

  private isDragging: boolean = false;
  private mouseDragStart: Position | undefined;

  private events = Array<MouseEv>();

  private wheelDelta: number = 1;

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

  static updateTouchMove(mouse: Mouse): (e: TouchEvent) => void {
    return (e: TouchEvent) => {
      const downBefore = mouse.primaryMouseButtonDown;
      mouse.primaryMouseButtonDown = e.touches.length === 1;

      const x: number | undefined = mouse.primaryMouseButtonDown
        ? e.touches.item(0)?.pageX
        : (e.type === "touchend" || e.type === "touchcancel") &&
          e.changedTouches.length === 1
        ? e.changedTouches.item(0)?.pageX
        : undefined;

      const y: number | undefined = mouse.primaryMouseButtonDown
        ? e.touches.item(0)?.pageY
        : (e.type === "touchend" || e.type === "touchcancel") &&
          e.changedTouches.length === 1
        ? e.changedTouches.item(0)?.pageY
        : undefined;

      const prevTwoFingerTouch = mouse.twoFingerTouch;
      mouse.twoFingerTouch = e.touches.length === 2;

      const prevTouchPinchDiff = mouse.touchPinchDiff;

      if (mouse.twoFingerTouch) {
        const x1 = e.touches.item(0)?.pageX ?? 0;
        const y1 = e.touches.item(0)?.pageY ?? 0;
        const x2 = e.touches.item(1)?.pageX ?? 0;
        const y2 = e.touches.item(1)?.pageY ?? 0;

        mouse.touchPinchDiff = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        const mid = {
          x: (x1 + x2) / 2,
          y: (y1 + y2) / 2
        }
        const zoomEv: MouseZoom = {
          type: "MouseZoom",
          point: mid
        }
        mouse.events.push(zoomEv);
      }
      else {
        mouse.touchPinchDiff = -1;
      }

      if (x && y) {
        mouse.mousePosition = { x, y };
      }

      if (prevTwoFingerTouch && !mouse.twoFingerTouch) {
        return;
      }
      else if (mouse.twoFingerTouch && mouse.touchPinchDiff > prevTouchPinchDiff) {
        mouse.wheelDelta /= 1.1;
      }
      else if (mouse.twoFingerTouch && mouse.touchPinchDiff < prevTouchPinchDiff) {
        mouse.wheelDelta *= 1.1;
      }
      /*else if (
        mouse.primaryMouseButtonDown &&
        mouse.mouseDragStart &&
        !mouse.isDragging &&
        x &&
        y
      ) {
        const dx = Math.abs(mouse.mouseDragStart.x - x);
        const dy = Math.abs(mouse.mouseDragStart.y - y);

        if (dx > 5 || dy > 5) {
          mouse.isDragging = true;
        }
      } else if (
        mouse.isDragging &&
        mouse.mouseDragStart &&
        downBefore &&
        !mouse.primaryMouseButtonDown &&
        x &&
        y
      ) {
        mouse.isDragging = false;
        const e: MouseDrag = {
          type: "MouseDrag",
          from: mouse.mouseDragStart,
          to: { x, y },
        };
        mouse.events.push(e);
        mouse.mouseDragStart = undefined;
      } else if (
        !downBefore &&
        mouse.primaryMouseButtonDown &&
        x &&
        y &&
        mouse.mouseDragStart === undefined
      ) {
        console.log(`setting mouse drag start ${x} ${y}`);
        mouse.mouseDragStart = {
          x,
          y,
        };
      } else if (downBefore && !mouse.primaryMouseButtonDown && x && y) {
        const e: MouseClick = {
          type: "MouseClick",
          position: { x, y },
        };
        mouse.mouseDragStart = undefined;
        mouse.events.push(e);
      }*/
    };
  }

  static updateMouseWheel(mouse: Mouse): (e: WheelEvent) => void {
    return (e: WheelEvent) => {
      e.preventDefault();
      console.log(e.deltaY);
      if (e.deltaY > 0) {
        mouse.wheelDelta *= 1.1;
      }
      else {
        mouse.wheelDelta /= 1.1;
      }
      const ev: MouseZoom = {
        type: "MouseZoom",
        point: { x: e.pageX, y: e.pageY }
      }
      mouse.events.push(ev);
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

  update(gameState: MouseGameState): void {
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

    gameState.scale = capScale(this.wheelDelta);

    this.events = [];
  }
}
