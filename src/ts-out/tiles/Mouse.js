"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mouse = void 0;
const domain_1 = require("./domain");
class Mouse {
    mousePosition;
    mouseDownCounter;
    isDragging = false;
    mouseDragStart;
    events = Array();
    isMouseDown() {
        return this.mouseDownCounter != undefined && this.mouseDownCounter != 0;
    }
    static updateMouseUp(mouse) {
        return () => {
            const downBefore = mouse.isMouseDown();
            mouse.mouseDownCounter = (mouse.mouseDownCounter ?? 0) - 1;
            const currentPos = mouse.mousePosition;
            if (mouse.isDragging &&
                currentPos &&
                mouse.mouseDragStart &&
                downBefore &&
                !mouse.isMouseDown()) {
                mouse.isDragging = false;
                const e = {
                    type: "MouseDrag",
                    from: mouse.mouseDragStart,
                    to: currentPos,
                };
                mouse.events.push(e);
                mouse.mouseDragStart = undefined;
            }
            else if (currentPos && downBefore && !mouse.isMouseDown()) {
                const e = {
                    type: "MouseClick",
                    position: currentPos,
                };
                mouse.mouseDragStart = undefined;
                mouse.events.push(e);
            }
        };
    }
    static updateMouseDown(mouse) {
        return () => {
            const downBefore = mouse.isMouseDown();
            mouse.mouseDownCounter = (mouse.mouseDownCounter ?? 0) + 1;
            if (!downBefore &&
                mouse.isMouseDown() &&
                mouse.mousePosition &&
                mouse.mouseDragStart == undefined) {
                mouse.mouseDragStart = mouse.mousePosition;
            }
        };
    }
    static updateMousePosition(mouse) {
        return (e) => {
            mouse.mousePosition = new domain_1.Position(e.pageX, e.pageY);
            if (mouse.isMouseDown() &&
                mouse.mouseDragStart &&
                mouse.mousePosition &&
                !mouse.isDragging) {
                const dx = Math.abs(mouse.mouseDragStart.x - mouse.mousePosition.x);
                const dy = Math.abs(mouse.mouseDragStart.y - mouse.mousePosition.y);
                if (dx > 5 || dy > 5) {
                    mouse.isDragging = true;
                }
            }
        };
    }
    updateGameState(state) {
        state.mousePosition = this.mousePosition;
        state.mouseEvents = this.events;
        if (this.isDragging && state.mousePosition && this.mouseDragStart) {
            const e = {
                type: "MouseDrag",
                from: this.mouseDragStart,
                to: state.mousePosition,
            };
            state.mouseDragInProgress = e;
        }
        else {
            state.mouseDragInProgress = undefined;
        }
        this.events = [];
    }
}
exports.Mouse = Mouse;
//# sourceMappingURL=Mouse.js.map