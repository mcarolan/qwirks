"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileGrid = exports.allLines = void 0;
const trampoline_ts_1 = require("trampoline-ts");
const Domain_1 = require("./Domain");
const immutable_1 = require("immutable");
function neighbours(grid, position, direction) {
    const inner = (0, trampoline_ts_1.trampoline)((p, acc) => {
        const tile = grid.at(p);
        if (tile) {
            if (acc) {
                return inner.cont(direction(p), acc.push(tile));
            }
            else {
                return inner.cont(direction(p), immutable_1.List.of(tile));
            }
        }
        else {
            return acc;
        }
    });
    return inner(direction(position), undefined);
}
function buildLine(before, elem, after) {
    if (before) {
        return before.push(elem).concat(after !== null && after !== void 0 ? after : (0, immutable_1.List)());
    }
    else if (after) {
        return immutable_1.List.of(elem).concat(after);
    }
    else {
        return undefined;
    }
}
function isValidLine(line) {
    const distinctColours = (0, immutable_1.Set)(line.map((t) => t.colour)).size;
    const distinctShapes = (0, immutable_1.Set)(line.map((t) => t.shape)).size;
    if (distinctColours === 1) {
        return distinctShapes === line.size;
    }
    else if (distinctShapes === 1) {
        return distinctColours === line.size;
    }
    else {
        return false;
    }
}
function allLines(grid, placements) {
    return placements
        .flatMap((placement) => {
        var _a, _b;
        const l = neighbours(grid, placement.position, Domain_1.left);
        const r = neighbours(grid, placement.position, Domain_1.right);
        const a = neighbours(grid, placement.position, Domain_1.above);
        const b = neighbours(grid, placement.position, Domain_1.below);
        const l1 = (_a = buildLine(l, placement, r)) !== null && _a !== void 0 ? _a : (0, immutable_1.List)();
        const l2 = (_b = buildLine(a, placement, b)) !== null && _b !== void 0 ? _b : (0, immutable_1.List)();
        return immutable_1.List.of(l1, l2).filter((l) => l.size > 0);
    })
        .toSet();
}
exports.allLines = allLines;
function scoreLine(line) {
    if (line.size === 6) {
        return 12;
    }
    else {
        return line.size;
    }
}
function scoreLines(lines) {
    return lines
        .toList()
        .map(scoreLine)
        .reduce((acc, n) => acc + n, 0);
}
class TileGrid {
    constructor(tiles) {
        this.tiles = tiles;
        this.elems = new Map();
        tiles.forEach((pt) => this.elems.set(this.mapKey(pt.position), pt));
    }
    static empty() {
        return new TileGrid([]);
    }
    mapKey(position) {
        return `${position.x},${position.y}`;
    }
    get values() {
        return this.elems.values();
    }
    place(placements) {
        const overlapping = placements.filter((p) => this.elems.has(this.mapKey(p.position)));
        if (overlapping.size > 0) {
            return { type: "PlacingOverCurrentlyPlacedTiles", tiles: overlapping };
        }
        if (this.elems.size === 0 &&
            !placements.some((p) => (0, immutable_1.is)((0, immutable_1.fromJS)(p.position), (0, immutable_1.fromJS)(Domain_1.ORIGIN)))) {
            return { type: "PlacementOnEmptyGridMustBeAtOrigin" };
        }
        const dupes = placements.filter((p) => placements.filter((p2) => (0, immutable_1.is)(p, p2)).size > 1);
        if (dupes.size > 0) {
            return { type: "DuplicatePlacement", tiles: dupes };
        }
        //viable enough to try to construct the grid
        const res = new TileGrid(this.tiles.concat(placements.toSet().toArray()));
        const lines = allLines(res, placements);
        const invalidLines = lines.filter((l) => !isValidLine(l));
        if (!invalidLines.isEmpty()) {
            console.log(`invalid lines ${JSON.stringify(invalidLines)}`);
            return { type: "CreatesInvalidLines", lines: invalidLines };
        }
        const singleTilePlacedOnEmpty = this.size === 0 && placements.size === 1;
        if (!lines.some((l) => placements.every((p) => l.some((pt) => (0, immutable_1.is)(p, pt)))) &&
            !singleTilePlacedOnEmpty) {
            return { type: "AllPlacedTilesMustBeInALine" };
        }
        const deduped = lines.map((l) => l.toSet());
        const score = singleTilePlacedOnEmpty ? 1 : scoreLines(deduped);
        return { type: "Success", tileGrid: res, score: score, lines: deduped };
    }
    at(pos) {
        return this.elems.get(this.mapKey(pos));
    }
    get size() {
        return this.elems.size;
    }
}
exports.TileGrid = TileGrid;
//# sourceMappingURL=TileGrid.js.map