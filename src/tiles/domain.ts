import { TileGrid } from "./TileGrid";
import { Set, is, hash, List } from "immutable";

class Tile {
  constructor(readonly colour: TileColour, readonly shape: TileShape) {}

  toString(): string {
    return `Tile(${this.colour}, ${this.shape})`;
  }

  equals(other: unknown): boolean {
    const o = other as Tile;
    return o && is(o.colour, this.colour) && is(o.shape, this.shape);
  }

  hashCode(): number {
    return hash(this.colour.toString()) + hash(this.shape.toString());
  }
}

class PositionedTile {
  constructor(readonly tile: Tile, readonly position: Position) {}

  static from(
    position: Position,
    colour: TileColour,
    shape: TileShape
  ): PositionedTile {
    return new PositionedTile(new Tile(colour, shape), position);
  }

  get colour(): TileColour {
    return this.tile.colour;
  }

  get shape(): TileShape {
    return this.tile.shape;
  }

  toString(): string {
    return `(${this.tile.toString()}, ${this.position.toString()})`;
  }

  equals(other: unknown): boolean {
    const o = other as PositionedTile;
    return o && is(o.position, this.position) && is(o.tile, this.tile);
  }

  hashCode(): number {
    return this.tile.hashCode() + this.position.hashCode();
  }
}

class Position {
  constructor(readonly x: number, readonly y: number) {}

  public static below(pos: Position): Position {
    return new Position(pos.x, pos.y - 1);
  }

  public static above(pos: Position): Position {
    return new Position(pos.x, pos.y + 1);
  }

  public static left(pos: Position): Position {
    return new Position(pos.x - 1, pos.y);
  }

  public static right(pos: Position): Position {
    return new Position(pos.x + 1, pos.y);
  }

  toString(): string {
    return `(${this.x}, ${this.y})`;
  }

  equals(other: unknown): boolean {
    const o = other as Position;
    return o && o.x === this.x && o.y === this.y;
  }

  hashCode(): number {
    return hash(this.x) + hash(this.y);
  }
}

class Rect {
  constructor(
    readonly position: Position,
    readonly width: number,
    readonly height: number
  ) {}

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

enum TileColour {
  Yellow = "yellow",
  Red = "red",
  Purple = "purple",
  Orange = "orange",
  Green = "green",
  Blue = "blue",
}

enum TileShape {
  One = "one",
  Two = "two",
  Three = "three",
  Four = "four",
  Five = "five",
  Six = "six",
}

export {
  PositionedTile,
  Position,
  Tile,
  TileShape,
  PlacementResult,
  TileColour,
  PlacementOnEmptyGridMustBeAtOrigin,
  PlacingOverCurrentlyPlacedTiles,
  DuplicatePlacement,
  CreatesInvalidLines,
  AllPlacedTilesMustBeInALine,
  Success,
  Rect,
  prettyPrint,
};
