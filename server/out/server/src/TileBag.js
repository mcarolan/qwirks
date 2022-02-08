"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileBag = void 0;
const immutable_1 = require("immutable");
const Domain_1 = require("../../shared/Domain");
class TileBag {
    constructor(contents) {
        this.contents = contents;
    }
    take(n) {
        const took = this.contents.take(n);
        return [took, new TileBag(this.contents.skip(n))];
    }
    add(tiles) {
        return new TileBag(this.contents.concat(tiles).sortBy(Math.random));
    }
    static everyTile() {
        return (0, immutable_1.List)().withMutations((mutable) => {
            (0, Domain_1.allTileColours)().forEach((colour) => {
                (0, Domain_1.allTileShapes)().forEach((shape) => {
                    mutable.push({ colour, shape });
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