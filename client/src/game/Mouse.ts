import { capScale } from "../state/GameState";
import { distanceBetween, normalise, Position } from "../../../shared/Domain";

export interface MouseState {
  mousePosition: Position;
  primaryDown: boolean;
  multiDown: boolean;
  offset: Position;
  startPan: Position;
  scale: number;
  touchPinchDiff: number;
  clicks: Position[];
  dragStart: [DOMHighResTimeStamp, Position];
  lastPotentialTouchClick: [DOMHighResTimeStamp, Position];
  touchClickEnabled: boolean;
  driftDirection: Position;
  driftAcceleration: number;
  lastFrame: DOMHighResTimeStamp;
}

export function registerMouseUpdater(document: Document, initialOffset: Position): MouseUpdater {
  const touchEnabled = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const mouseUpdater = new MouseUpdater(initialOffset);
  if (touchEnabled) {
    document.addEventListener("touchmove", (e) => mouseUpdater.touchEvent(e));
    document.addEventListener("touchcancel", (e) => mouseUpdater.touchEvent(e));
    document.addEventListener("touchend", (e) => mouseUpdater.touchEvent(e));
    document.addEventListener("touchstart", (e) => mouseUpdater.touchEvent(e));
  } else {
    document.addEventListener("mousemove", (e) => mouseUpdater.mouseEvent(e));
    document.addEventListener("mousedown", (e) => mouseUpdater.mouseEvent(e));
    document.addEventListener("mouseup", (e) => mouseUpdater.mouseEvent(e));
    document.addEventListener("wheel", (e) => mouseUpdater.wheelEvent(e));
  }
  return mouseUpdater;
}


export function worldToScreen(world: Position, state: MouseState): Position {
  return {
      x: (world.x - state.offset.x) * state.scale,
      y: (world.y - state.offset.y) * state.scale
  };
};

export function screenToWorld(screen: Position, state: MouseState): Position {
  return {
      x: screen.x / state.scale + state.offset.x,
      y: screen.y / state.scale + state.offset.y
  };
}

export class MouseUpdater {
  private DRAG_TOLERANCE: number = 3;
  private NULL_TIME_POSITION: [DOMHighResTimeStamp, Position] = [-1, { x: 0, y: 0}];
  private TOUCH_CLICK_LAG = 150;
  private TOUCH_ZOOM_DELTA = 1.07;
  private DRIFT_AMOUNT = 100;
  private DRIFT_DECELERATION = 0.9;

  constructor(private initialOffset: Position) {}

  state: MouseState = {
      mousePosition: { x: 0, y: 0 },
      primaryDown: false,
      multiDown: false,
      offset: {...this.initialOffset},
      startPan: { x: 0, y: 0 },
      scale: 1,
      touchPinchDiff: -1,
      clicks: [],
      dragStart: this.NULL_TIME_POSITION,
      lastPotentialTouchClick: this.NULL_TIME_POSITION,
      touchClickEnabled: true,
      driftDirection: { x: 0, y: 0 },
      driftAcceleration: -1,
      lastFrame: -1
  };

  wheelEvent(e: WheelEvent): void {
      const beforeZoom = screenToWorld(this.state.mousePosition, this.state);
      if (e.deltaY > 0) {
          this.state.scale = capScale(this.state.scale * 1.01);
      }
      else {
          this.state.scale = capScale(this.state.scale * 0.99);
      }
      const afterZoom = screenToWorld(this.state.mousePosition, this.state);
      this.state.offset = { x: this.state.offset.x + (beforeZoom.x - afterZoom.x), y: this.state.offset.y + (beforeZoom.y - afterZoom.y) };
  }

  mouseEvent(e: MouseEvent): void {
      this.state.mousePosition = { x: e.pageX, y: e.pageY };

      const flags = e.buttons !== undefined ? e.buttons : e.which;
      const downBefore = this.state.primaryDown;
      this.state.primaryDown = (flags & 1) === 1;

      if (!downBefore && this.state.primaryDown) {
          this.state.startPan = { ...this.state.mousePosition };
      }

      if (downBefore && this.state.primaryDown && distanceBetween(this.state.startPan, this.state.mousePosition) > this.DRAG_TOLERANCE) {
          this.state.offset = { x: this.state.offset.x - ((this.state.mousePosition.x - this.state.startPan.x) / this.state.scale), y: this.state.offset.y - ((this.state.mousePosition.y - this.state.startPan.y) / this.state.scale) };
          this.state.startPan = { ...this.state.mousePosition };
          if (this.state.dragStart[0] === -1) {
            this.state.dragStart = [performance.now(), { ...this.state.mousePosition }]
            this.state.driftAcceleration = 0;
          }
      }

      if (downBefore && !this.state.primaryDown) {
          if (this.state.dragStart[0] > 0) {
              const dragTime = performance.now() - this.state.dragStart[0];
              const dragDistance = distanceBetween(this.state.dragStart[1], this.state.mousePosition);
              this.state.driftDirection = normalise({ x: this.state.mousePosition.x - this.state.dragStart[1].x, y:  this.state.mousePosition.y - this.state.dragStart[1].y });
              this.state.driftAcceleration = dragDistance / dragTime;
              this.state.dragStart = this.NULL_TIME_POSITION;
              console.log(`${dragDistance} in ${dragTime} gives acceleration of ${this.state.driftAcceleration}. driftDirection: ${JSON.stringify(this.state.driftDirection)}`);
          }
          else {
              this.state.clicks.push({ ...this.state.mousePosition });
          }
      }
  }

  touchEvent(e: TouchEvent): void {
      const singleFingerDown = e.touches.length === 1;
      const multiFingersDown = e.touches.length === 2;

      const downBefore = this.state.primaryDown;
      this.state.primaryDown = singleFingerDown;

      if (singleFingerDown) {
          this.state.mousePosition = { x: e.touches.item(0)?.pageX ?? 0, y: e.touches.item(0)?.pageY ?? 0 };

          if (!downBefore) {
              this.state.startPan = { ...this.state.mousePosition };
              if (this.state.touchClickEnabled) {
                  this.state.lastPotentialTouchClick = [performance.now(), { ...this.state.mousePosition}];
              }
          }
          else if (distanceBetween(this.state.startPan, this.state.mousePosition) > this.DRAG_TOLERANCE) {
              this.state.offset = { x: this.state.offset.x - ((this.state.mousePosition.x - this.state.startPan.x) / this.state.scale), y: this.state.offset.y - ((this.state.mousePosition.y - this.state.startPan.y) / this.state.scale) };
              this.state.startPan = { ...this.state.mousePosition };
              this.state.lastPotentialTouchClick = this.NULL_TIME_POSITION;
              this.state.touchClickEnabled = false;

            if (this.state.dragStart[0] === -1) {
                this.state.dragStart = [performance.now(), { ...this.state.mousePosition }]
                this.state.driftAcceleration = 0;
            }
          }
      }
      
      if (multiFingersDown) {
          this.state.lastPotentialTouchClick = this.NULL_TIME_POSITION;
          this.state.touchClickEnabled = false;
          const x1 = e.touches.item(0)?.pageX ?? 0;
          const y1 = e.touches.item(0)?.pageY ?? 0;
          const x2 = e.touches.item(1)?.pageX ?? 0;
          const y2 = e.touches.item(1)?.pageY ?? 0;
  
          const prevTouchPinchDiff = this.state.touchPinchDiff;
          this.state.touchPinchDiff = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
          this.state.mousePosition = {
            x: (x1 + x2) / 2,
            y: (y1 + y2) / 2
          }

          if (prevTouchPinchDiff > 0 && this.state.touchPinchDiff != prevTouchPinchDiff) {
              const beforeZoom = screenToWorld(this.state.mousePosition, this.state);
              if (this.state.touchPinchDiff > prevTouchPinchDiff) {
                  this.state.scale = capScale(this.state.scale * this.TOUCH_ZOOM_DELTA);
              }
              else {
                  this.state.scale = capScale(this.state.scale / this.TOUCH_ZOOM_DELTA);
              }
              const afterZoom = screenToWorld(this.state.mousePosition, this.state);
              this.state.offset = { x: this.state.offset.x + (beforeZoom.x - afterZoom.x), y: this.state.offset.y + (beforeZoom.y - afterZoom.y) };
          }
      }

      if (e.touches.length === 0) {
          this.state.touchClickEnabled = true;

          if (this.state.dragStart[0] > 0) {
            const dragTime = performance.now() - this.state.dragStart[0];
            const dragDistance = distanceBetween(this.state.dragStart[1], this.state.mousePosition);
            this.state.driftDirection = normalise({ x: this.state.mousePosition.x - this.state.dragStart[1].x, y:  this.state.mousePosition.y - this.state.dragStart[1].y });
            this.state.driftAcceleration = dragDistance / dragTime;
            this.state.dragStart = this.NULL_TIME_POSITION;
            console.log(`${dragDistance} in ${dragTime} gives acceleration of ${this.state.driftAcceleration}. driftDirection: ${JSON.stringify(this.state.driftDirection)}`);
        }
      }
  }

  update(time: DOMHighResTimeStamp): void {
      if (this.state.lastFrame === -1) {
          this.state.lastFrame = time;
      }
      const timeSinceLastFrame = time - this.state.lastFrame;
      this.state.lastFrame = time;
      if (this.state.touchClickEnabled && this.state.lastPotentialTouchClick != this.NULL_TIME_POSITION && (time - this.state.lastPotentialTouchClick[0]) > this.TOUCH_CLICK_LAG) {
          this.state.clicks.push({ ...this.state.lastPotentialTouchClick[1] });
          this.state.lastPotentialTouchClick = this.NULL_TIME_POSITION;
      }

      if (this.state.driftAcceleration > 0) {
        const delta: Position = { x: this.state.driftDirection.x * this.DRIFT_AMOUNT * (timeSinceLastFrame / 1000) * this.state.driftAcceleration, y: this.state.driftDirection.y * this.DRIFT_AMOUNT * (timeSinceLastFrame / 1000) * this.state.driftAcceleration };
        this.state.offset = { x: this.state.offset.x - (delta.x / this.state.scale), y: this.state.offset.y - (delta.y / this.state.scale) };
        this.state.driftAcceleration *= this.DRIFT_DECELERATION;
      }
      
      if (this.state.driftAcceleration < 0.001) {
          this.state.driftAcceleration = 0;
      }
  }
}
