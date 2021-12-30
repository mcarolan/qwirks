import { List } from "immutable";
import { forIn } from "lodash";
import { Tile, TileColour, TileShape } from "./domain";

export class TileBag {
  constructor(private readonly contents: List<Tile>) {}

  take(n: number): [List<Tile>, TileBag] {
    const took = this.contents.take(n);
    return [took, new TileBag(this.contents.skip(n))];
  }

  private static everyTile(): List<Tile> {
    return List<Tile>().withMutations((mutable) => {
      forIn(TileColour, (colour, _) => {
        forIn(TileShape, (shape, _) => {
          mutable.push(new Tile(colour, shape));
        });
      });
    });
  }

  static full(): TileBag {
    const list = this.everyTile()
      .concat(this.everyTile())
      .concat(this.everyTile());

    return new TileBag(list.sortBy(Math.random));
  }
}
