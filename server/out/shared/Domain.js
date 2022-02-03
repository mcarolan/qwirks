"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettyPrint = exports.Position = exports.PositionedTile = exports.Tile = exports.allTileShapes = exports.TileShape = exports.allTileColours = exports.TileColour = void 0;
const immutable_1 = require("immutable");
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
class Tile {
    constructor(colour, shape) {
        this.colour = colour;
        this.shape = shape;
    }
    toString() {
        return `Tile(${this.colour}, ${this.shape})`;
    }
    equals(other) {
        const o = other;
        return o && (0, immutable_1.is)(o.colour, this.colour) && (0, immutable_1.is)(o.shape, this.shape);
    }
    hashCode() {
        return (0, immutable_1.hash)(this.colour.toString()) + (0, immutable_1.hash)(this.shape.toString());
    }
}
exports.Tile = Tile;
class PositionedTile {
    constructor(tile, position) {
        this.tile = tile;
        this.position = position;
    }
    static from(position, colour, shape) {
        return new PositionedTile(new Tile(colour, shape), position);
    }
    get colour() {
        return this.tile.colour;
    }
    get shape() {
        return this.tile.shape;
    }
    toString() {
        return `(${this.tile.toString()}, ${this.position.toString()})`;
    }
    equals(other) {
        const o = other;
        return o && (0, immutable_1.is)(o.position, this.position) && (0, immutable_1.is)(o.tile, this.tile);
    }
    hashCode() {
        return this.tile.hashCode() + this.position.hashCode();
    }
}
exports.PositionedTile = PositionedTile;
class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static below(pos) {
        return new Position(pos.x, pos.y - 1);
    }
    static above(pos) {
        return new Position(pos.x, pos.y + 1);
    }
    static left(pos) {
        return new Position(pos.x - 1, pos.y);
    }
    static right(pos) {
        return new Position(pos.x + 1, pos.y);
    }
    minus(other) {
        return new Position(this.x - other.x, this.y - other.y);
    }
    plus(other) {
        return new Position(this.x + other.x, this.y + other.y);
    }
    distanceTo(other) {
        const xDistance = this.x - other.x;
        const yDistance = this.y - other.y;
        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    }
    toString() {
        return `(${this.x}, ${this.y})`;
    }
    equals(other) {
        const o = other;
        return o && o.x === this.x && o.y === this.y;
    }
    hashCode() {
        return (0, immutable_1.hash)(this.x) + (0, immutable_1.hash)(this.y);
    }
}
exports.Position = Position;
Position.ZERO = new Position(0, 0);
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