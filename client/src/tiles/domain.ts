import { TileGrid } from "./TileGrid";
import { Set, hash, List } from "immutable";
import { Position, PositionedTile } from "../../../shared/Domain";

class Rect {
  constructor(
    readonly position: Position,
    readonly width: number,
    readonly height: number
  ) {}

  static from(element: HTMLElement): Rect {
    const r = element.getBoundingClientRect();
    return new Rect(new Position(r.left, r.top), r.width, r.height);
  }

  contains(position: Position): boolean {
    return (
      position.x >= this.position.x &&
      position.x <= this.position.x + this.width &&
      position.y >= this.position.y &&
      position.y <= this.position.y + this.height
    );
  }

  middle(): Position {
    return new Position(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
  }

  toString(): string {
    return `(${this.position.toString()}, width=${this.width}, height=${
      this.height
    })`;
  }

  equals(other: unknown): boolean {
    const o = other as Rect;
    return (
      o &&
      o.position.equals(this.position) &&
      o.width === this.width &&
      o.height === this.height
    );
  }

  hashCode(): number {
    return this.position.hashCode() + hash(this.width) + hash(this.height);
  }
}

interface PlacementOnEmptyGridMustBeAtOrigin {
  type: "PlacementOnEmptyGridMustBeAtOrigin";
}

interface PlacingOverCurrentlyPlacedTiles {
  type: "PlacingOverCurrentlyPlacedTiles";
  tiles: Set<PositionedTile>;
}

interface DuplicatePlacement {
  type: "DuplicatePlacement";
  tiles: Set<PositionedTile>;
}

interface CreatesInvalidLines {
  type: "CreatesInvalidLines";
  lines: Set<List<PositionedTile>>;
}

interface AllPlacedTilesMustBeInALine {
  type: "AllPlacedTilesMustBeInALine";
}

interface Success {
  type: "Success";
  tileGrid: TileGrid;
  score: number;
  lines: Set<Set<PositionedTile>>;
}

type PlacementResult =
  | PlacementOnEmptyGridMustBeAtOrigin
  | PlacingOverCurrentlyPlacedTiles
  | DuplicatePlacement
  | CreatesInvalidLines
  | AllPlacedTilesMustBeInALine
  | Success;

function prettyPrint(placementResult: PlacementResult): string {
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

export {
  PositionedTile,
  Position,
  PlacementResult,
  PlacementOnEmptyGridMustBeAtOrigin,
  PlacingOverCurrentlyPlacedTiles,
  DuplicatePlacement,
  CreatesInvalidLines,
  AllPlacedTilesMustBeInALine,
  Success,
  Rect,
  prettyPrint,
};
