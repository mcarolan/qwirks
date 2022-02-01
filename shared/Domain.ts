import { is, hash } from "immutable";

export enum TileColour {
  Yellow = "yellow",
  Red = "red",
  Purple = "purple",
  Orange = "orange",
  Green = "green",
  Blue = "blue",
}

export function allTileColours(): TileColour[] {
  return [
    TileColour.Yellow,
    TileColour.Red,
    TileColour.Purple,
    TileColour.Orange,
    TileColour.Green,
    TileColour.Blue,
  ];
}

export enum TileShape {
  One = "one",
  Two = "two",
  Three = "three",
  Four = "four",
  Five = "five",
  Six = "six",
}

export function allTileShapes(): TileShape[] {
  return [
    TileShape.One,
    TileShape.Two,
    TileShape.Three,
    TileShape.Four,
    TileShape.Five,
    TileShape.Six,
  ];
}

export class Tile {
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

export class PositionedTile {
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

export class Position {
  public static ZERO: Position = new Position(0, 0);

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

  minus(other: Position): Position {
    return new Position(this.x - other.x, this.y - other.y);
  }

  plus(other: Position): Position {
    return new Position(this.x + other.x, this.y + other.y);
  }

  distanceTo(other: Position): number {
    const xDistance = this.x - other.x;
    const yDistance = this.y - other.y;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
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
