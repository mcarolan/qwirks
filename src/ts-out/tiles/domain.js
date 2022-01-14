"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettyPrint = exports.Rect = exports.TileColour = exports.TileShape = exports.Tile = exports.Position = exports.PositionedTile = void 0;
const immutable_1 = require("immutable");
class Tile {
    colour;
    shape;
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
    tile;
    position;
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
    x;
    y;
    static ZERO = new Position(0, 0);
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
class Rect {
    position;
    width;
    height;
    constructor(position, width, height) {
        this.position = position;
        this.width = width;
        this.height = height;
    }
    contains(position) {
        return (position.x >= this.position.x &&
            position.x <= this.position.x + this.width &&
            position.y >= this.position.y &&
            position.y <= this.position.y + this.height);
    }
    middle() {
        return new Position(this.position.x + this.width / 2, this.position.y + this.height / 2);
    }
    toString() {
        return `(${this.position.toString()}, width=${this.width}, height=${this.height})`;
    }
    equals(other) {
        const o = other;
        return (o &&
            o.position.equals(this.position) &&
            o.width === this.width &&
            o.height === this.height);
    }
    hashCode() {
        return this.position.hashCode() + (0, immutable_1.hash)(this.width) + (0, immutable_1.hash)(this.height);
    }
}
exports.Rect = Rect;
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
            return `${placementResult.type} (${placementResult.lines})`;
        case "AllPlacedTilesMustBeInALine":
            return `${placementResult.type}`;
    }
}
exports.prettyPrint = prettyPrint;
var TileColour;
(function (TileColour) {
    TileColour["Yellow"] = "yellow";
    TileColour["Red"] = "red";
    TileColour["Purple"] = "purple";
    TileColour["Orange"] = "orange";
    TileColour["Green"] = "green";
    TileColour["Blue"] = "blue";
})(TileColour || (TileColour = {}));
exports.TileColour = TileColour;
var TileShape;
(function (TileShape) {
    TileShape["One"] = "one";
    TileShape["Two"] = "two";
    TileShape["Three"] = "three";
    TileShape["Four"] = "four";
    TileShape["Five"] = "five";
    TileShape["Six"] = "six";
})(TileShape || (TileShape = {}));
exports.TileShape = TileShape;
//# sourceMappingURL=domain.js.map