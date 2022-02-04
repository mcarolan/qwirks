"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettyPrint = exports.distanceBetween = exports.plus = exports.minus = exports.right = exports.left = exports.above = exports.below = exports.allTileShapes = exports.TileShape = exports.allTileColours = exports.TileColour = void 0;
var TileColour;
(function (TileColour) {
    TileColour["Yellow"] = "yellow";
    TileColour["Red"] = "red";
    TileColour["Purple"] = "purple";
    TileColour["Orange"] = "orange";
    TileColour["Green"] = "green";
    TileColour["Blue"] = "blue";
})(TileColour = exports.TileColour || (exports.TileColour = {}));
function allTileColours() {
    return [
        TileColour.Yellow,
        TileColour.Red,
        TileColour.Purple,
        TileColour.Orange,
        TileColour.Green,
        TileColour.Blue,
    ];
}
exports.allTileColours = allTileColours;
var TileShape;
(function (TileShape) {
    TileShape["One"] = "one";
    TileShape["Two"] = "two";
    TileShape["Three"] = "three";
    TileShape["Four"] = "four";
    TileShape["Five"] = "five";
    TileShape["Six"] = "six";
})(TileShape = exports.TileShape || (exports.TileShape = {}));
function allTileShapes() {
    return [
        TileShape.One,
        TileShape.Two,
        TileShape.Three,
        TileShape.Four,
        TileShape.Five,
        TileShape.Six,
    ];
}
exports.allTileShapes = allTileShapes;
function below(pos) {
    return Object.assign(Object.assign({}, pos), { y: pos.y - 1 });
}
exports.below = below;
function above(pos) {
    return Object.assign(Object.assign({}, pos), { y: pos.y + 1 });
}
exports.above = above;
function left(pos) {
    return Object.assign(Object.assign({}, pos), { x: pos.x - 1 });
}
exports.left = left;
function right(pos) {
    return Object.assign(Object.assign({}, pos), { x: pos.x + 1 });
}
exports.right = right;
function minus(a, b) {
    return {
        x: a.x - b.x,
        y: a.y - b.y,
    };
}
exports.minus = minus;
function plus(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
    };
}
exports.plus = plus;
function distanceBetween(a, b) {
    const xDistance = a.x - b.x;
    const yDistance = a.y - b.y;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}
exports.distanceBetween = distanceBetween;
function prettyPrint(placementResult) {
    switch (placementResult.type) {
        case "Success":
            return `${placementResult.type} (tile grid size ${placementResult.tileGrid.size})`;
        case "PlacingOverCurrentlyPlacedTiles":
            return `${placementResult.type} (${placementResult.tiles})`;
        case "PlacementOnEmptyGridMustBeAtOrigin":
            return `${placementResult.type}`;
        case "DuplicatePlacement":
            return `${placementResult.type} (${placementResult.tiles})`;
        case "CreatesInvalidLines":
            return `${placementResult.type} (${JSON.stringify(placementResult.lines)})`;
        case "AllPlacedTilesMustBeInALine":
            return `${placementResult.type}`;
    }
}
exports.prettyPrint = prettyPrint;
//# sourceMappingURL=Domain.js.map