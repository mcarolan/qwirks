"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileGridGraphics = void 0;
const TileGraphics_1 = require("./TileGraphics");
class TileGridGraphics {
    tileGridRect;
    mid;
    effectiveMid;
    constructor(tileGridRect) {
        this.tileGridRect = tileGridRect;
        this.mid = tileGridRect.middle();
        this.effectiveMid = tileGridRect.middle();
    }
    updateDragging(gameState) {
        const delta = (e) => e.from.minus(e.to);
        gameState.mouseEvents.forEach((e) => {
            if (e.type == "MouseDrag") {
                this.mid = this.mid.minus(delta(e));
            }
        });
        this.effectiveMid = this.mid;
        if (gameState.mouseDragInProgress) {
            this.effectiveMid = this.mid.minus(delta(gameState.mouseDragInProgress));
        }
    }
    updatePressedPositions(gameState) {
        const tilePositionsPressed = new Array();
        gameState.mouseEvents.forEach((e) => {
            if (e.type == "MouseClick") {
                if (this.tileGridRect.contains(e.position)) {
                    const xy = TileGraphics_1.TileGraphics.positionFromScreen(e.position, this.effectiveMid);
                    tilePositionsPressed.push(xy);
                }
            }
        });
        gameState.tilePositionsPressed = tilePositionsPressed;
    }
    updateGameState(state) {
        this.updateDragging(state);
        this.updatePressedPositions(state);
    }
    tilePositionToScreenCoords(tilePosition) {
        return TileGraphics_1.TileGraphics.screenCoords(tilePosition, this.effectiveMid);
    }
    draw(context, state) {
        if (state.mousePosition) {
            const hoveringTilePosition = TileGraphics_1.TileGraphics.positionFromScreen(state.mousePosition, this.effectiveMid);
            context.fillStyle = "#eeeeee";
            const screenCoords = TileGraphics_1.TileGraphics.screenCoords(hoveringTilePosition, this.effectiveMid);
            var singleActiveTile = undefined;
            if (state.panelActiveTileIndicies.size == 1) {
                const index = state.panelActiveTileIndicies.first();
                if (index != undefined) {
                    singleActiveTile = state.hand.get(index);
                }
            }
            if (singleActiveTile) {
                context.save();
                context.globalAlpha = 0.5;
                TileGraphics_1.TileGraphics.drawInactiveTile(context, screenCoords, singleActiveTile);
                context.restore();
            }
            else {
                context.fillRect(screenCoords.x, screenCoords.y, TileGraphics_1.TileGraphics.tileWidth, TileGraphics_1.TileGraphics.tileHeight);
            }
        }
        for (const pt of state.tileGridToDisplay.values) {
            const coords = TileGraphics_1.TileGraphics.screenCoords(pt.position, this.effectiveMid);
            if (state.currentPlacement.tiles.contains(pt)) {
                TileGraphics_1.TileGraphics.drawHoverTile(context, coords, pt.tile);
            }
            else {
                TileGraphics_1.TileGraphics.drawInactiveTile(context, coords, pt.tile);
            }
        }
    }
}
exports.TileGridGraphics = TileGridGraphics;
//# sourceMappingURL=TileGridGraphics.js.map