"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelGraphics = exports.PANEL_HEIGHT = void 0;
const domain_1 = require("./domain");
const TileGraphics_1 = require("./TileGraphics");
const utility_1 = require("./utility");
const immutable_1 = require("immutable");
const panelStartImage = (0, utility_1.loadImage)("./images/panel-start.png");
const PANEL_START_IMAGE_WIDTH = 26;
exports.PANEL_HEIGHT = 129;
const PANEL_END_IMAGE_WIDTH = 26;
const PANEL_ITEMS = 6;
const PADDING = 5;
const panelEndImage = (0, utility_1.loadImage)("./images/panel-end.png");
const panelRepaet = (0, utility_1.loadImage)("./images/panel-repeat.png");
const PANEL_WIDTH = PANEL_START_IMAGE_WIDTH +
    PADDING +
    PANEL_ITEMS * TileGraphics_1.TileGraphics.tileWidth +
    (PANEL_ITEMS - 1) * PADDING +
    PADDING +
    PANEL_END_IMAGE_WIDTH;
const PANEL_REPEAT_IMAGE_WIDTH = PANEL_WIDTH - PANEL_START_IMAGE_WIDTH - PANEL_END_IMAGE_WIDTH;
class PanelGraphics {
    position;
    newPosition(state) {
        return new domain_1.Position(state.canvasRect.width / 2 - PANEL_WIDTH / 2, state.canvasRect.height - PADDING - exports.PANEL_HEIGHT);
    }
    constructor(state) {
        this.position = this.newPosition(state);
    }
    tileRects(state) {
        const tileY = this.position.y +
            panelStartImage.height / 2 -
            TileGraphics_1.TileGraphics.tileHeight / 2;
        const startTileX = this.position.x + panelStartImage.width + PADDING;
        return (0, immutable_1.Map)(state.hand.map((_, i) => {
            const tileX = startTileX + i * TileGraphics_1.TileGraphics.tileWidth + i * PADDING;
            const tilePosition = new domain_1.Position(tileX, tileY);
            return [
                i,
                new domain_1.Rect(tilePosition, TileGraphics_1.TileGraphics.tileWidth, TileGraphics_1.TileGraphics.tileHeight),
            ];
        }));
    }
    updateGameState(state) {
        this.position = this.newPosition(state);
        const tileRects = this.tileRects(state);
        var newHover;
        const mousePosition = state.mousePosition;
        if (mousePosition) {
            tileRects.forEach((rect, i) => {
                if (rect.contains(mousePosition)) {
                    newHover = i;
                    return false;
                }
            });
        }
        state.mouseEvents.forEach((e) => {
            if (e.type == "MouseClick") {
                tileRects.forEach((rect, i) => {
                    if (rect.contains(e.position)) {
                        state.setPanelTileActive(i, !state.panelActiveTileIndicies.contains(i));
                        return false;
                    }
                });
            }
        });
        state.panelHoverTileIndex = newHover;
    }
    draw(context, state) {
        this.drawPanel(context);
        const tileRects = this.tileRects(state);
        state.hand.map((tile, i) => {
            const rect = tileRects.get(i);
            if (rect) {
                if (state.panelActiveTileIndicies.contains(i)) {
                    TileGraphics_1.TileGraphics.drawActiveTile(context, rect.position, tile);
                }
                else if (state.panelHoverTileIndex != undefined &&
                    (0, immutable_1.is)(state.panelHoverTileIndex, i)) {
                    TileGraphics_1.TileGraphics.drawHoverTile(context, rect.position, tile);
                }
                else {
                    TileGraphics_1.TileGraphics.drawInactiveTile(context, rect.position, tile);
                }
            }
        });
    }
    drawPanel(context) {
        const position = this.position;
        context.drawImage(panelStartImage, position.x, position.y - PADDING, PANEL_START_IMAGE_WIDTH, exports.PANEL_HEIGHT);
        context.drawImage(panelEndImage, position.x + PANEL_WIDTH - PANEL_END_IMAGE_WIDTH, position.y - PADDING, PANEL_END_IMAGE_WIDTH, exports.PANEL_HEIGHT);
        context.drawImage(panelRepaet, position.x + PANEL_START_IMAGE_WIDTH, position.y - PADDING, PANEL_REPEAT_IMAGE_WIDTH, exports.PANEL_HEIGHT);
    }
}
exports.PanelGraphics = PanelGraphics;
//# sourceMappingURL=PanelGraphics.js.map