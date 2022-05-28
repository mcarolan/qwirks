import { is, hash, Set, List } from "immutable";
import { TileGrid } from "./TileGrid";

export enum TileColour {
  Yellow,
  Red,
  Purple,
  Orange,
  Green,
  Blue,
}

export const allTileColours: TileColour[] =
  [
    TileColour.Yellow,
    TileColour.Red,
    TileColour.Purple,
    TileColour.Orange,
    TileColour.Green,
    TileColour.Blue,
  ];

export enum TileShape {
  One,
  Two,
  Three,
  Four,
  Five,
  Six,
}

export const allTileShapes: TileShape[] =
  [
    TileShape.One,
    TileShape.Two,
    TileShape.Three,
    TileShape.Four,
    TileShape.Five,
    TileShape.Six,
  ];

export interface Tile {
  colour: TileColour;
  shape: TileShape;
}

export interface PositionedTile extends Tile {
  position: Position;
}

export interface Position {
  x: number;
  y: number;
}

export function below(pos: Position): Position {
  return {
    ...pos,
    y: pos.y - 1,
  };
}

export function above(pos: Position): Position {
  return {
    ...pos,
    y: pos.y + 1,
  };
}

export function left(pos: Position): Position {
  return {
    ...pos,
    x: pos.x - 1,
  };
}

export function right(pos: Position) {
  return {
    ...pos,
    x: pos.x + 1,
  };
}

export function minus(a: Position, b: Position): Position {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  };
}

export function plus(a: Position, b: Position): Position {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

export function mul(p: Position, n: number): Position {
  return {
    x: p.x * n,
    y: p.y * n,
  };
}
export function divideScalar(p: Position, n: number): Position {
  return {
    x: p.x / n,
    y: p.y / n,
  };
}

export function normalise(p: Position): Position {
  const length = Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2));
  return { x: p.x / length, y: p.y / length };
}

export function distanceBetween(a: Position, b: Position): number {
  const xDistance = a.x - b.x;
  const yDistance = a.y - b.y;
  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

export interface PlacementOnEmptyGridMustBeAtOrigin {
  type: "PlacementOnEmptyGridMustBeAtOrigin";
}

export interface PlacingOverCurrentlyPlacedTiles {
  type: "PlacingOverCurrentlyPlacedTiles";
  tiles: Set<PositionedTile>;
}

export interface DuplicatePlacement {
  type: "DuplicatePlacement";
  tiles: Set<PositionedTile>;
}

export interface CreatesInvalidLines {
  type: "CreatesInvalidLines";
  lines: Set<List<PositionedTile>>;
}

export interface AllPlacedTilesMustBeInALine {
  type: "AllPlacedTilesMustBeInALine";
}

export interface Success {
  type: "Success";
  tileGrid: TileGrid;
  score: number;
  lines: Set<Set<PositionedTile>>;
}

export type PlacementResult =
  | PlacementOnEmptyGridMustBeAtOrigin
  | PlacingOverCurrentlyPlacedTiles
  | DuplicatePlacement
  | CreatesInvalidLines
  | AllPlacedTilesMustBeInALine
  | Success;

export function prettyPrint(placementResult: PlacementResult): string {
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
      return `${placementResult.type} (${JSON.stringify(
        placementResult.lines
      )})`;
    case "AllPlacedTilesMustBeInALine":
      return `${placementResult.type}`;
  }
}
