import { trampoline, ThunkOrValue } from "trampoline-ts";
import {
  PlacementResult,
  Position,
  PositionedTile,
  left,
  right,
  above,
  below,
} from "./Domain";

import { Set, List, is, fromJS } from "immutable";

function neighbours(
  grid: TileGrid,
  position: Position,
  direction: (p: Position) => Position
): List<PositionedTile> | undefined {
  const inner = trampoline(
    (
      p: Position,
      acc: List<PositionedTile> | undefined
    ): ThunkOrValue<List<PositionedTile> | undefined> => {
      const tile = grid.at(p);

      if (tile) {
        if (acc) {
          return inner.cont(direction(p), acc.push(tile));
        } else {
          return inner.cont(direction(p), List.of(tile));
        }
      } else {
        return acc;
      }
    }
  );

  return inner(direction(position), undefined);
}

function buildLine(
  before: List<PositionedTile> | undefined,
  elem: PositionedTile,
  after: List<PositionedTile> | undefined
): List<PositionedTile> | undefined {
  if (before) {
    return before.push(elem).concat(after ?? List());
  } else if (after) {
    return List.of(elem).concat(after);
  } else {
    return undefined;
  }
}

function isValidLine(line: List<PositionedTile>): boolean {
  const distinctColours = Set(line.map((t) => t.colour)).size;
  const distinctShapes = Set(line.map((t) => t.shape)).size;

  if (distinctColours === 1) {
    return distinctShapes === line.size;
  } else if (distinctShapes === 1) {
    return distinctColours === line.size;
  } else {
    return false;
  }
}

export function allLines(
  grid: TileGrid,
  placements: Set<PositionedTile>
): Set<List<PositionedTile>> {
  return placements
    .flatMap((placement) => {
      const l = neighbours(grid, placement.position, left);
      const r = neighbours(grid, placement.position, right);
      const a = neighbours(grid, placement.position, above);
      const b = neighbours(grid, placement.position, below);

      const l1 = buildLine(l, placement, r) ?? List();
      const l2 = buildLine(a, placement, b) ?? List();

      return List.of(l1, l2).filter((l) => l.size > 0);
    })
    .toSet();
}

function scoreLine(line: Set<PositionedTile>): number {
  if (line.size === 6) {
    return 12;
  } else {
    return line.size;
  }
}

function scoreLines(lines: Set<Set<PositionedTile>>): number {
  return lines
    .toList()
    .map(scoreLine)
    .reduce((acc, n) => acc + n, 0);
}

export class TileGrid {
  private elems: Map<string, PositionedTile>;

  constructor(public tiles: PositionedTile[]) {
    this.elems = new Map();
    tiles.forEach((pt) => this.elems.set(this.mapKey(pt.position), pt));
  }

  public static empty(): TileGrid {
    return new TileGrid([]);
  }

  private mapKey(position: Position): string {
    return `${position.x},${position.y}`;
  }

  get values(): IterableIterator<PositionedTile> {
    return this.elems.values();
  }

  place(placements: Set<PositionedTile>): PlacementResult {
    const overlapping = placements.filter((p) =>
      this.elems.has(this.mapKey(p.position))
    );
    if (overlapping.size > 0) {
      return { type: "PlacingOverCurrentlyPlacedTiles", tiles: overlapping };
    }

    if (
      this.elems.size === 0 &&
      !placements.some((p) => is(fromJS(p.position), fromJS({ x: 0, y: 0 })))
    ) {
      return { type: "PlacementOnEmptyGridMustBeAtOrigin" };
    }

    const dupes = placements.filter(
      (p) => placements.filter((p2) => is(p, p2)).size > 1
    );

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

    if (
      !lines.some((l) => placements.every((p) => l.some((pt) => is(p, pt)))) &&
      !singleTilePlacedOnEmpty
    ) {
      return { type: "AllPlacedTilesMustBeInALine" };
    }

    const deduped = lines.map((l) => l.toSet());
    const score = singleTilePlacedOnEmpty ? 1 : scoreLines(deduped);

    return { type: "Success", tileGrid: res, score: score, lines: deduped };
  }

  at(pos: Position): PositionedTile | undefined {
    return this.elems.get(this.mapKey(pos));
  }

  get size(): number {
    return this.elems.size;
  }
}
