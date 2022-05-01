import {
  PlacementResult,
  Position,
  PositionedTile,
  Success,
} from "../../../shared/Domain";
import { TileGrid } from "../../../shared/TileGrid";
import { is, Set, List, fromJS } from "immutable";
import { TileColour, TileShape, Tile } from "../../../shared/Domain";

const ORIGIN: Position = { x: 0, y: 0 };

function expectSuccess<T>(res: PlacementResult, f: (a: Success) => T): T {
  switch (res.type) {
    case "Success":
      return f(res);
    case "AllPlacedTilesMustBeInALine":
      expect(`${res.type} was not a success`).toEqual("");
      throw 1;
    case "CreatesInvalidLines":
      expect(`${res.type} with ${res.lines} was not a success`).toEqual("");
      throw 1;
    case "DuplicatePlacement":
      expect(`${res.type} with ${res.tiles} was not a success`).toEqual("");
      throw 1;
    case "PlacementOnEmptyGridMustBeAtOrigin":
      expect(`${res.type} was not a success`).toEqual("");
      throw 1;
    case "PlacingOverCurrentlyPlacedTiles":
      expect(`${res.type} with ${res.tiles} was not a success`).toEqual("");
      throw 1;
  }
}

describe("basic", () => {
  test("can place a tile at position (0, 0)", () => {
    const pos = ORIGIN;
    const t = { position: pos, colour: TileColour.Red, shape: TileShape.One };

    const tg = TileGrid.empty();

    const result = tg.place(Set.of(t));

    expectSuccess(result, (s) => {
      expect(s.tileGrid.size).toEqual(1);
      expect(s.tileGrid.at(pos)).toEqual(t);
      expect(s.score).toEqual(1);
    });
  });

  test("cannot place at (1, 0) on an empty grid", () => {
    const pt = {
      position: { x: 1, y: 0 },
      colour: TileColour.Red,
      shape: TileShape.One,
    };
    const tg = TileGrid.empty();

    const result = tg.place(Set.of(pt));

    expect(result.type).toEqual("PlacementOnEmptyGridMustBeAtOrigin");
  });
});

test("line equality", () => {
  const a1 = List.of(
    fromJS({
      position: { x: 0, y: 1 },
      colour: TileColour.Blue,
      shape: TileShape.One,
    }),
    fromJS({
      position: { x: 1, y: 1 },
      colour: TileColour.Green,
      shape: TileShape.Four,
    })
  );
  const a2 = List.of(
    fromJS({
      position: { x: 0, y: 1 },
      colour: TileColour.Blue,
      shape: TileShape.One,
    }),
    fromJS({
      position: { x: 1, y: 1 },
      colour: TileColour.Green,
      shape: TileShape.Four,
    })
  );

  expect(is(a1, a2)).toBeTruthy();
});

describe("neighbourhood size 2", () => {
  interface TestCase {
    name: string;
    tile1: Tile;
    tile2: Tile;
    shouldBeSuccess: boolean;
  }
  const position1 = ORIGIN;

  const positions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  const cases: TestCase[] = [
    {
      name: "same colour different shape",
      tile1: { colour: TileColour.Red, shape: TileShape.One },
      tile2: { colour: TileColour.Red, shape: TileShape.Two },
      shouldBeSuccess: true,
    },
    {
      name: "different colour same shape",
      tile1: { colour: TileColour.Red, shape: TileShape.One },
      tile2: { colour: TileColour.Blue, shape: TileShape.One },
      shouldBeSuccess: true,
    },
    {
      name: "same colour same shape",
      tile1: { colour: TileColour.Red, shape: TileShape.One },
      tile2: { colour: TileColour.Red, shape: TileShape.One },
      shouldBeSuccess: false,
    },
    {
      name: "different colour different shape",
      tile1: { colour: TileColour.Red, shape: TileShape.One },
      tile2: { colour: TileColour.Blue, shape: TileShape.Two },
      shouldBeSuccess: false,
    },
  ];

  positions.forEach((position2) => {
    cases.forEach((c) => {
      test(`${position2} ${c.name}`, () => {
        const tg = TileGrid.empty();
        const pt1 = { ...c.tile1, position: position1 };
        const pt2 = { ...c.tile2, position: position2 };
        const placement = Set.of(pt1, pt2);

        const res = tg.place(placement);

        if (c.shouldBeSuccess) {
          expectSuccess(res, (s) => {
            expect(s.tileGrid.size).toEqual(2);
            expect(s.tileGrid.at(position1)).toEqual(pt1);
            expect(s.tileGrid.at(position2)).toEqual(pt2);
            expect(s.score).toEqual(2);
          });
        } else {
          expect(res.type).not.toEqual("Success");
        }
      });
    });
  });

  test("cannot replace an already placed tile", () => {
    const pt: PositionedTile = {
      position: ORIGIN,
      colour: TileColour.Red,
      shape: TileShape.One,
    };

    const tg = TileGrid.empty();
    const res1 = tg.place(Set.of(pt));

    expectSuccess(res1, (s) => {
      const res2 = s.tileGrid.place(Set.of(pt));
      expect(res2.type).toEqual("PlacingOverCurrentlyPlacedTiles");
    });
  });
});

describe("neighbourhood size 3", () => {
  interface Positions {
    description: string;
    position2: Position;
    position3: Position;
  }

  const positions: Positions[] = [
    {
      description: "to right",
      position2: { x: 1, y: 0 },
      position3: { x: 2, y: 0 },
    },
    {
      description: "above",
      position2: { x: 0, y: 1 },
      position3: { x: 0, y: 2 },
    },
    {
      description: "below",
      position2: { x: 0, y: -1 },
      position3: { x: 0, y: -2 },
    },
    {
      description: "to left",
      position2: { x: -1, y: 0 },
      position3: { x: -2, y: 0 },
    },
    {
      description: "either side",
      position2: { x: -1, y: 0 },
      position3: { x: 1, y: 0 },
    },
    {
      description: "above below",
      position2: { x: 0, y: 1 },
      position3: { x: 0, y: -1 },
    },
  ];

  interface TestCase {
    description: string;
    tile1: Tile;
    tile2: Tile;
    tile3: Tile;
    shouldBeSuccess: boolean;
  }

  const cases: TestCase[] = [
    {
      description: "same shape different colours",
      tile1: { colour: TileColour.Red, shape: TileShape.One },
      tile2: { colour: TileColour.Yellow, shape: TileShape.One },
      tile3: { colour: TileColour.Purple, shape: TileShape.One },
      shouldBeSuccess: true,
    },
    {
      description: "different shape same colours",
      tile1: { colour: TileColour.Red, shape: TileShape.One },
      tile2: { colour: TileColour.Red, shape: TileShape.Two },
      tile3: { colour: TileColour.Red, shape: TileShape.Three },
      shouldBeSuccess: true,
    },
    {
      description: "same shape repeated colours",
      tile1: { colour: TileColour.Red, shape: TileShape.One },
      tile2: { colour: TileColour.Yellow, shape: TileShape.One },
      tile3: { colour: TileColour.Red, shape: TileShape.One },
      shouldBeSuccess: false,
    },
    {
      description: "repeated shape same colour",
      tile1: { colour: TileColour.Red, shape: TileShape.One },
      tile2: { colour: TileColour.Red, shape: TileShape.Two },
      tile3: { colour: TileColour.Red, shape: TileShape.One },
      shouldBeSuccess: false,
    },
  ];

  const position1: Position = ORIGIN;

  positions.forEach((position) => {
    cases.forEach((c) => {
      test(`${position.description} ${c.description}`, () => {
        const tg = TileGrid.empty();

        const pt1 = { ...c.tile1, position: position1 };
        const pt2 = { ...c.tile2, position: position.position2 };
        const pt3 = { ...c.tile3, position: position.position3 };

        const res1 = tg.place(Set.of(pt1, pt2));
        expectSuccess(res1, (s1) => {
          const res2 = s1.tileGrid.place(Set.of(pt3));
          if (c.shouldBeSuccess) {
            expectSuccess(res2, (s2) => {
              expect(s2.tileGrid.size).toEqual(3);
              expect(s2.tileGrid.at(position1)).toEqual(pt1);
              expect(s2.tileGrid.at(position.position2)).toEqual(pt2);
              expect(s2.tileGrid.at(position.position3)).toEqual(pt3);
              expect(s2.score).toEqual(3);
            });
          } else {
            expect(res2.type).not.toEqual("Success");
          }
        });
      });
    });
  });
});

describe("advanced", () => {
  test("bonus for a full set in a line", () => {
    const pt1: PositionedTile = {
      position: ORIGIN,
      colour: TileColour.Red,
      shape: TileShape.One,
    };
    const pt2: PositionedTile = {
      position: { x: 0, y: 1 },
      colour: TileColour.Red,
      shape: TileShape.Two,
    };
    const pt3: PositionedTile = {
      position: { x: 0, y: 2 },
      colour: TileColour.Red,
      shape: TileShape.Three,
    };
    const pt4: PositionedTile = {
      position: { x: 0, y: 3 },
      colour: TileColour.Red,
      shape: TileShape.Four,
    };
    const pt5: PositionedTile = {
      position: { x: 0, y: 4 },
      colour: TileColour.Red,
      shape: TileShape.Five,
    };
    const pt6: PositionedTile = {
      position: { x: 0, y: 5 },
      colour: TileColour.Red,
      shape: TileShape.Six,
    };

    const tg = TileGrid.empty();

    const res1 = tg.place(Set.of(pt1, pt2, pt3, pt4, pt5));

    expectSuccess(res1, (s1) => {
      expect(s1.score).toBe(5);
      const res2 = s1.tileGrid.place(Set.of(pt6));
      expectSuccess(res2, (s2) => {
        expect(s2.score).toBe(12);
      });
    });
  });

  test("scores across multiple lines", () => {
    const pt1: PositionedTile = {
      position: ORIGIN,
      colour: TileColour.Red,
      shape: TileShape.One,
    };
    const pt2: PositionedTile = {
      position: { x: 0, y: 1 },
      colour: TileColour.Red,
      shape: TileShape.Two,
    };
    const pt3: PositionedTile = {
      position: { x: 1, y: 0 },
      colour: TileColour.Blue,
      shape: TileShape.One,
    };
    const pt4: PositionedTile = {
      position: { x: 1, y: 1 },
      colour: TileColour.Blue,
      shape: TileShape.Two,
    };

    const tg = TileGrid.empty();

    const res1 = tg.place(Set.of(pt1, pt2));

    expectSuccess(res1, (s1) => {
      expect(s1.score).toBe(2);
      const res2 = s1.tileGrid.place(Set.of(pt3, pt4));
      expectSuccess(res2, (s2) => {
        expect(s2.score).toBe(6);
      });
    });
  });

  test("ensures all neighbourhoods are valid", () => {
    const pt1: PositionedTile = {
      position: ORIGIN,
      colour: TileColour.Red,
      shape: TileShape.One,
    };

    const pt2: PositionedTile = {
      position: { x: 1, y: 0 },
      colour: TileColour.Red,
      shape: TileShape.Three,
    };

    const pt3: PositionedTile = {
      position: { x: 0, y: -1 },
      colour: TileColour.Red,
      shape: TileShape.Two,
    };

    const pt4: PositionedTile = {
      position: { x: 1, y: -1 },
      colour: TileColour.Red,
      shape: TileShape.Three,
    };

    const tg = TileGrid.empty();

    const res1 = tg.place(Set.of(pt1, pt2));

    expectSuccess(res1, (s1) => {
      const res2 = s1.tileGrid.place(Set.of(pt3));
      expectSuccess(res2, (s2) => {
        const res3 = s2.tileGrid.place(Set.of(pt4));
        expect(res3.type).not.toEqual("Success");
      });
    });
  });

  test("cannot 3 tile place with a gap", () => {
    const pt1: PositionedTile = {
      position: ORIGIN,
      colour: TileColour.Red,
      shape: TileShape.One,
    };

    const pt2: PositionedTile = {
      position: { x: 1, y: 0 },
      colour: TileColour.Red,
      shape: TileShape.Three,
    };

    const pt3: PositionedTile = {
      position: { x: 3, y: 0 },
      colour: TileColour.Red,
      shape: TileShape.Four,
    };

    const tg = TileGrid.empty();
    const res = tg.place(Set.of(pt1, pt2, pt3));

    expect(res.type).not.toEqual("Success");
  });

  test("cannot make a second placement not connected", () => {
    const pt1: PositionedTile = {
      position: ORIGIN,
      colour: TileColour.Red,
      shape: TileShape.One,
    };

    const pt2: PositionedTile = {
      position: { x: 1, y: 0 },
      colour: TileColour.Red,
      shape: TileShape.Three,
    };

    const pt3: PositionedTile = {
      position: { x: 3, y: 0 },
      colour: TileColour.Red,
      shape: TileShape.Four,
    };

    const tg = TileGrid.empty();
    const res1 = tg.place(Set.of(pt1, pt2));

    expectSuccess(res1, (s1) => {
      const res2 = s1.tileGrid.place(Set.of(pt3));
      expect(res2.type).not.toEqual("Success");
    });
  });

  test("cannot place diagonally", () => {
    const pt1: PositionedTile = {
      position: ORIGIN,
      colour: TileColour.Red,
      shape: TileShape.One,
    };
    const pt2: PositionedTile = {
      position: { x: 1, y: 1 },
      colour: TileColour.Red,
      shape: TileShape.Three,
    };
    const tg = TileGrid.empty();
    const res = tg.place(Set.of(pt1, pt2));
    expect(res.type).not.toEqual("Success");
  });
});
