"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileBag = void 0;
const immutable_1 = require("immutable");
const lodash_1 = require("lodash");
const domain_1 = require("./domain");
class TileBag {
    contents;
    constructor(contents) {
        this.contents = contents;
    }
    take(n) {
        const took = this.contents.take(n);
        return [took, new TileBag(this.contents.skip(n))];
    }
    static everyTile() {
        return (0, immutable_1.List)().withMutations((mutable) => {
            (0, lodash_1.forIn)(domain_1.TileColour, (colour, _) => {
                (0, lodash_1.forIn)(domain_1.TileShape, (shape, _) => {
                    mutable.push(new domain_1.Tile(colour, shape));
                });
            });
        });
    }
    static full() {
        const list = this.everyTile()
            .concat(this.everyTile())
            .concat(this.everyTile());
        return new TileBag(list.sortBy(Math.random));
    }
}
exports.TileBag = TileBag;
//# sourceMappingURL=TileBag.js.map