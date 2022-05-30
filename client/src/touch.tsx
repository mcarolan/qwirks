import { distanceBetween, Position, TileColour, TileShape } from "../../shared/Domain";
import { loadTileGraphics, TileGraphics } from "./graphics/TileGraphics";

const canvas = document.querySelector("#game") as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;


interface MouseState {
    mousePosition: Position;
    primaryDown: boolean;
    multiDown: boolean;
    offset: Position;
    startPan: Position;
    scale: Position;
    touchPinchDiff: number;
    clicks: Position[];
    isDragging: boolean;
    lastPotentialTouchClick: [DOMHighResTimeStamp, Position];
    touchClickDisabled: boolean;
}

class MouseUpdater {
    private DRAG_TOLERANCE: number = 3;
    private NO_POTENTIAL_TOUCH_CLICK: [DOMHighResTimeStamp, Position] = [-1, { x: 0, y: 0}];
    private TOUCH_CLICK_LAG = 150;

    state: MouseState = {
        mousePosition: { x: 0, y: 0 },
        primaryDown: false,
        multiDown: false,
        offset: { x: -(window.innerWidth / 2), y: -(window.innerHeight / 2) },
        startPan: { x: 0, y: 0 },
        scale: { x: 1, y: 1},
        touchPinchDiff: -1,
        clicks: [],
        isDragging: false,
        lastPotentialTouchClick: this.NO_POTENTIAL_TOUCH_CLICK,
        touchClickDisabled: false
    };

    wheelEvent(e: WheelEvent): void {
        const beforeZoom = screenToWorld(this.state.mousePosition, this.state.offset, this.state.scale);
        if (e.deltaY > 0) {
            this.state.scale = { x: this.state.scale.x * 1.1, y: this.state.scale.y * 1.1 }
        }
        else {
            this.state.scale = { x: this.state.scale.x * 0.9, y: this.state.scale.y * 0.9 }
        }
        const afterZoom = screenToWorld(this.state.mousePosition, this.state.offset, this.state.scale);
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
            this.state.offset = { x: this.state.offset.x - ((this.state.mousePosition.x - this.state.startPan.x) / this.state.scale.x), y: this.state.offset.y - ((this.state.mousePosition.y - this.state.startPan.y) / this.state.scale.y) };
            this.state.startPan = { ...this.state.mousePosition };
            this.state.isDragging = true;
        }

        if (downBefore && !this.state.primaryDown) {
            if (this.state.isDragging) {
                this.state.isDragging = false;
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
                if (!this.state.touchClickDisabled) {
                    this.state.lastPotentialTouchClick = [performance.now(), { ...this.state.mousePosition}];
                }
            }
            else if (distanceBetween(this.state.startPan, this.state.mousePosition) > this.DRAG_TOLERANCE) {
                this.state.offset = { x: this.state.offset.x - ((this.state.mousePosition.x - this.state.startPan.x) / this.state.scale.x), y: this.state.offset.y - ((this.state.mousePosition.y - this.state.startPan.y) / this.state.scale.y) };
                this.state.startPan = { ...this.state.mousePosition };
                this.state.lastPotentialTouchClick = this.NO_POTENTIAL_TOUCH_CLICK;
                this.state.touchClickDisabled = true;
            }
        }
        
        if (multiFingersDown) {
            this.state.lastPotentialTouchClick = this.NO_POTENTIAL_TOUCH_CLICK;
            this.state.touchClickDisabled = true;
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
                const beforeZoom = screenToWorld(this.state.mousePosition, this.state.offset, this.state.scale);
                if (this.state.touchPinchDiff > prevTouchPinchDiff) {
                    this.state.scale = { x: this.state.scale.x * 1.1, y: this.state.scale.y * 1.1 }
                }
                else {
                    this.state.scale = { x: this.state.scale.x * 0.9, y: this.state.scale.y * 0.9 }
                }
                const afterZoom = screenToWorld(this.state.mousePosition, this.state.offset, this.state.scale);
                this.state.offset = { x: this.state.offset.x + (beforeZoom.x - afterZoom.x), y: this.state.offset.y + (beforeZoom.y - afterZoom.y) };
            }
        }

        if (e.touches.length === 0) {
            this.state.touchClickDisabled = false;
        }
    }

    update(time: DOMHighResTimeStamp): void {
        if (!this.state.touchClickDisabled && this.state.lastPotentialTouchClick != this.NO_POTENTIAL_TOUCH_CLICK && (time - this.state.lastPotentialTouchClick[0]) > this.TOUCH_CLICK_LAG) {
            this.state.clicks.push({ ...this.state.lastPotentialTouchClick[1] });
            this.state.lastPotentialTouchClick = this.NO_POTENTIAL_TOUCH_CLICK;
        }
    }
}


function isTouchEnabled(): boolean {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

const mouseUpdater = new MouseUpdater();

const clickPositions: Position[] = [];

if (isTouchEnabled()) {
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

function worldToScreen(world: Position, offset: Position, scale: Position): Position {
    return {
        x: (world.x - offset.x) * scale.x,
        y: (world.y - offset.y) * scale.y
    };
}

function screenToWorld(screen: Position, offset: Position, scale: Position): Position {
    return {
        x: screen.x / scale.x + offset.x,
        y: screen.y / scale.y + offset.y
    };
}

function frame(tileGraphics: TileGraphics):(time: DOMHighResTimeStamp) => void {
    return (time: DOMHighResTimeStamp) => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        mouseUpdater.update(time);

        if (mouseUpdater.state.clicks.length > 0) {
            mouseUpdater.state.clicks.forEach((p) => {
                console.log(`click at ${JSON.stringify(p)}`);
                clickPositions.push(screenToWorld(p, mouseUpdater.state.offset, mouseUpdater.state.scale));
            });
            mouseUpdater.state.clicks = [];
        }

        ctx.save();
        const greenWorldPos: Position = { x: 50, y: 50 };
        const greenScreenPos: Position = worldToScreen(greenWorldPos, mouseUpdater.state.offset, mouseUpdater.state.scale);
        tileGraphics.drawInactiveTile(ctx, greenScreenPos, { colour: TileColour.Green, shape: TileShape.One }, mouseUpdater.state.scale.x);

        const redWorldPos: Position = { x: 300, y: 300};
        const redScreenPos: Position = worldToScreen(redWorldPos, mouseUpdater.state.offset, mouseUpdater.state.scale);
        tileGraphics.drawInactiveTile(ctx, redScreenPos, { colour: TileColour.Red, shape: TileShape.Two }, mouseUpdater.state.scale.x);

        clickPositions.forEach((p) => {
            const screenPos: Position = worldToScreen(p, mouseUpdater.state.offset, mouseUpdater.state.scale);
            tileGraphics.drawInactiveTile(ctx, screenPos, { colour: TileColour.Yellow, shape: TileShape.Three }, mouseUpdater.state.scale.x);
        });
        ctx.restore();

        requestAnimationFrame(frame(tileGraphics));
    };
}


loadTileGraphics().then((tg) => {
    requestAnimationFrame(frame(tg))
});