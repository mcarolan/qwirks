import { List } from "immutable";
import { allTileColours, allTileShapes, Tile } from "../../shared/Domain";

export function removeFromHand<T extends Tile>(
  tiles: List<T>,
  toRemove: Iterable<T>
): List<T> {
  var removed = tiles;
  for (const tile of toRemove) {
    const index = removed.findIndex(
      (t) => tile.shape === t.shape && tile.colour === t.colour
    );
    if (index > -1) {
      removed = removed.remove(index);
    }
  }
  return removed;
}

export class TileBag {
  constructor(readonly contents: List<Tile>) {}

  take(n: number): [List<Tile>, TileBag] {
    const took = this.contents.take(n);
    return [took, new TileBag(this.contents.skip(n))];
  }

  add(tiles: List<Tile>): TileBag {
    return new TileBag(this.contents.concat(tiles).sortBy(Math.random));
  }

  private static everyTile(): List<Tile> {
    return List<Tile>().withMutations((mutable) => {
      allTileColours().forEach((colour) => {
        allTileShapes().forEach((shape) => {
          mutable.push({ colour, shape });
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
