import { is, List } from "immutable";
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

export function serializeTileBag(tileBag: TileBag): Uint8Array {
  const counts: number[] = [];
  allTileColours.forEach((colour) => {
    allTileShapes.forEach((shape) => {
      counts.push(tileBag.count({ colour, shape }))
    });
  });
  return new Uint8Array(counts);
}

export function deserializeTileBag(arr: Uint8Array): TileBag {
  const contents: Tile[] = [];
  for (const [i, count] of arr.entries()) {
    for (var j = 0; j < count; ++j) {
      const colour = allTileColours[Math.floor(i / allTileColours.length)];
      const shape = allTileShapes[Math.floor(i % allTileShapes.length)];
      const tile: Tile = { colour, shape };
      contents.push(tile);
    }
  }
  return new TileBag(List(contents).sortBy(Math.random));
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

  count(tile: Tile): number {
    return this.contents.count((t) => is(t.colour, tile.colour) && is(t.shape, tile.shape));
  }

  private static everyTile(): List<Tile> {
    return List<Tile>().withMutations((mutable) => {
      allTileColours.forEach((colour) => {
        allTileShapes.forEach((shape) => {
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
