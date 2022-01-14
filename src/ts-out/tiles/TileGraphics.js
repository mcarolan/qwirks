"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileGraphics = void 0;
const domain_1 = require("./domain");
const lodash_1 = require("lodash");
const utility_1 = require("./utility");
function loadImageCache() {
    let colours = new Map();
    (0, lodash_1.forIn)(domain_1.TileColour, (colourValue, _) => {
        let shapes = new Map();
        (0, lodash_1.forIn)(domain_1.TileShape, (shapeValue, _) => {
            const src = `./images/${shapeValue.toString()}-${colourValue.toString()}.png`;
            shapes.set(shapeValue, (0, utility_1.loadImage)(src));
        });
        colours.set(colourValue, shapes);
    });
    return colours;
}
const imageCache = loadImageCache();
const emptyTileImage = (0, utility_1.loadImage)("./images/empty-tile.png");
const blankTileImage = (0, utility_1.loadImage)("./images/blank-tile.png");
const hoverTileImage = (0, utility_1.loadImage)("./images/hover-tile.png");
const activeTileImage = (0, utility_1.loadImage)("./images/active-tile.png");
const symWidth = emptyTileImage.width / 2;
const symHeight = emptyTileImage.height / 2;
const PADDING = 10;
class TileGraphics {
    static drawEmptyTile(context, position) {
        context.drawImage(emptyTileImage, position.x, position.y, emptyTileImage.width, emptyTileImage.height);
    }
    static get tileWidth() {
        return emptyTileImage.width;
    }
    static get tileHeight() {
        return emptyTileImage.height;
    }
    static drawHoverTile(context, position, tile) {
        this.drawTile(context, position, tile, hoverTileImage);
    }
    static drawInactiveTile(context, position, tile) {
        this.drawTile(context, position, tile, blankTileImage);
    }
    static drawActiveTile(context, position, tile) {
        this.drawTile(context, position, tile, activeTileImage);
    }
    static drawTile(context, position, tile, tileBackground) {
        context.drawImage(tileBackground, position.x, position.y, blankTileImage.width, blankTileImage.height);
        const inner = imageCache
            .get(tile.colour)
            ?.get(tile.shape);
        if (inner) {
            context.drawImage(inner, position.x + symWidth / 2, position.y + symHeight / 2, symWidth, symHeight);
        }
    }
    static screenCoords(pos, mid) {
        const tileX = pos.x * TileGraphics.tileWidth + pos.x * PADDING;
        const tileY = pos.y * TileGraphics.tileHeight + pos.y * PADDING;
        return new domain_1.Position(mid.x + tileX, mid.y + tileY);
    }
    static positionFromScreen(screen, mid) {
        const tileX = (screen.x - mid.x) / (TileGraphics.tileWidth + PADDING);
        const tileY = (screen.y - mid.y) / (TileGraphics.tileHeight + PADDING);
        return new domain_1.Position(Math.floor(tileX), Math.floor(tileY));
    }
}
exports.TileGraphics = TileGraphics;
//# sourceMappingURL=TileGraphics.js.map