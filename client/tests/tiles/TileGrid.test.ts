import {
  PlacementResult,
  Position,
  PositionedTile,
  Success,
} from "../../src/tiles/domain";
import { TileGrid } from "../../src/tiles/TileGrid";
import { is, Set, List } from "immutable";
import { TileColour, TileShape, Tile } from "../../../shared/Domain";

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
    const pos = new Position(0, 0);
    const t = PositionedTile.from(pos, TileColour.Red, TileShape.One);

    const tg = TileGrid.empty();

    const result = tg.place(Set.of(t));

    expectSuccess(result, (s) => {
      expect(s.tileGrid.size).toEqual(1);
      expect(s.tileGrid.at(pos)).toEqual(t);
      expect(s.score).toEqual(1);
    });
  });

  test("cannot place at (1, 0) on an empty grid", () => {
    const pt = PositionedTile.from(
      new Position(1, 0),
      TileColour.Red,
      TileShape.One
    );
    const tg = TileGrid.empty();

    const result = tg.place(Set.of(pt));

    expect(result.type).toEqual("PlacementOnEmptyGridMustBeAtOrigin");
  });
});

test("line equality", () => {
  const a1: List<PositionedTile> = List.of(
    PositionedTile.from(new Position(0, 1), TileColour.Blue, TileShape.One),
    PositionedTile.from(new Position(1, 1), TileColour.Green, TileShape.Four)
  );
  const a2: List<PositionedTile> = List.of(
    PositionedTile.from(new Position(0, 1), TileColour.Blue, TileShape.One),
    PositionedTile.from(new Position(1, 1), TileColour.Green, TileShape.Four)
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
  const position1 = new Position(0, 0);

  const positions = [
    new Position(1, 0),
    new Position(-1, 0),
    new Position(0, 1),
    new Position(0, -1),
  ];

  const cases: TestCase[] = [
    {
      name: "same colour different shape",
      tile1: new Tile(TileColour.Red, TileShape.One),
      tile2: new Tile(TileColour.Red, TileShape.Two),
      shouldBeSuccess: true,
    },
    {
      name: "different colour same shape",
      tile1: new Tile(TileColour.Red, TileShape.One),
      tile2: new Tile(TileColour.Blue, TileShape.One),
      shouldBeSuccess: true,
    },
    {
      name: "same colour same shape",
      tile1: new Tile(TileColour.Red, TileShape.One),
      tile2: new Tile(TileColour.Red, TileShape.One),
      shouldBeSuccess: false,
    },
    {
      name: "different colour different shape",
      tile1: new Tile(TileColour.Red, TileShape.One),
      tile2: new Tile(TileColour.Blue, TileShape.Two),
      shouldBeSuccess: false,
    },
  ];

  positions.forEach((position2) => {
    cases.forEach((c) => {
      test(`${position2} ${c.name}`, () => {
        const tg = TileGrid.empty();
        const pt1 = new PositionedTile(c.tile1, position1);
        const pt2 = new PositionedTile(c.tile2, position2);
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
    const pt: PositionedTile = PositionedTile.from(
      new Position(0, 0),
      TileColour.Red,
      TileShape.One
    );

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
      position2: new Position(1, 0),
      position3: new Position(2, 0),
    },
    {
      description: "above",
      position2: new Position(0, 1),
      position3: new Position(0, 2),
    },
    {
      description: "below",
      position2: new Position(0, -1),
      position3: new Position(0, -2),
    },
    {
      description: "to left",
      position2: new Position(-1, 0),
      position3: new Position(-2, 0),
    },
    {
      description: "either side",
      position2: new Position(-1, 0),
      position3: new Position(1, 0),
    },
    {
      description: "above below",
      position2: new Position(0, 1),
      position3: new Position(0, -1),
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
      tile1: new Tile(TileColour.Red, TileShape.One),
      tile2: new Tile(TileColour.Yellow, TileShape.One),
      tile3: new Tile(TileColour.Purple, TileShape.One),
      shouldBeSuccess: true,
    },
    {
      description: "different shape same colours",
      tile1: new Tile(TileColour.Red, TileShape.One),
      tile2: new Tile(TileColour.Red, TileShape.Two),
      tile3: new Tile(TileColour.Red, TileShape.Three),
      shouldBeSuccess: true,
    },
    {
      description: "same shape repeated colours",
      tile1: new Tile(TileColour.Red, TileShape.One),
      tile2: new Tile(TileColour.Yellow, TileShape.One),
      tile3: new Tile(TileColour.Red, TileShape.One),
      shouldBeSuccess: false,
    },
    {
      description: "repeated shape same colour",
      tile1: new Tile(TileColour.Red, TileShape.One),
      tile2: new Tile(TileColour.Red, TileShape.Two),
      tile3: new Tile(TileColour.Red, TileShape.One),
      shouldBeSuccess: false,
    },
  ];

  const position1: Position = new Position(0, 0);

  positions.forEach((position) => {
    cases.forEach((c) => {
      test(`${position.description} ${c.description}`, () => {
        const tg = TileGrid.empty();

        const pt1 = new PositionedTile(c.tile1, position1);
        const pt2 = new PositionedTile(c.tile2, position.position2);
        const pt3 = new PositionedTile(c.tile3, position.position3);

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
    const pt1: PositionedTile = PositionedTile.from(
      new Position(0, 0),
      TileColour.Red,
      TileShape.One
    );
    const pt2: PositionedTile = PositionedTile.from(
      new Position(0, 1),
      TileColour.Red,
      TileShape.Two
    );
    const pt3: PositionedTile = PositionedTile.from(
      new Position(0, 2),
      TileColour.Red,
      TileShape.Three
    );
    const pt4: PositionedTile = PositionedTile.from(
      new Position(0, 3),
      TileColour.Red,
      TileShape.Four
    );
    const pt5: PositionedTile = PositionedTile.from(
      new Position(0, 4),
      TileColour.Red,
      TileShape.Five
    );
    const pt6: PositionedTile = PositionedTile.from(
      new Position(0, 5),
      TileColour.Red,
      TileShape.Six
    );

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
    const pt1: PositionedTile = PositionedTile.from(
      new Position(0, 0),
      TileColour.Red,
      TileShape.One
    );
    const pt2: PositionedTile = PositionedTile.from(
      new Position(0, 1),
      TileColour.Red,
      TileShape.Two
    );
    const pt3: PositionedTile = PositionedTile.from(
      new Position(1, 0),
      TileColour.Blue,
      TileShape.One
    );
    const pt4: PositionedTile = PositionedTile.from(
      new Position(1, 1),
      TileColour.Blue,
      TileShape.Two
    );

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
    const pt1: PositionedTile = PositionedTile.from(
      new Position(0, 0),
      TileColour.Red,
      TileShape.One
    );

    const pt2: PositionedTile = PositionedTile.from(
      new Position(1, 0),
      TileColour.Red,
      TileShape.Three
    );

    const pt3: PositionedTile = PositionedTile.from(
      new Position(0, -1),
      TileColour.Red,
      TileShape.Two
    );

    const pt4: PositionedTile = PositionedTile.from(
      new Position(1, -1),
      TileColour.Red,
      TileShape.Three
    );

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
    const pt1: PositionedTile = PositionedTile.from(
      new Position(0, 0),
      TileColour.Red,
      TileShape.One
    );

    const pt2: PositionedTile = PositionedTile.from(
      new Position(1, 0),
      TileColour.Red,
      TileShape.Three
    );

    const pt3: PositionedTile = PositionedTile.from(
      new Position(3, 0),
      TileColour.Red,
      TileShape.Four
    );

    const tg = TileGrid.empty();
    const res = tg.place(Set.of(pt1, pt2, pt3));

    expect(res.type).not.toEqual("Success");
  });

  test("cannot make a second placement not connected", () => {
    const pt1: PositionedTile = PositionedTile.from(
      new Position(0, 0),
      TileColour.Red,
      TileShape.One
    );

    const pt2: PositionedTile = PositionedTile.from(
      new Position(1, 0),
      TileColour.Red,
      TileShape.Three
    );

    const pt3: PositionedTile = PositionedTile.from(
      new Position(3, 0),
      TileColour.Red,
      TileShape.Four
    );

    const tg = TileGrid.empty();
    const res1 = tg.place(Set.of(pt1, pt2));

    expectSuccess(res1, (s1) => {
      const res2 = s1.tileGrid.place(Set.of(pt3));
      expect(res2.type).not.toEqual("Success");
    });
  });

  test("cannot place diagonally", () => {
    const pt1: PositionedTile = PositionedTile.from(
      new Position(0, 0),
      TileColour.Red,
      TileShape.One
    );
    const pt2: PositionedTile = PositionedTile.from(
      new Position(1, 1),
      TileColour.Red,
      TileShape.Three
    );
    const tg = TileGrid.empty();
    const res = tg.place(Set.of(pt1, pt2));
    expect(res.type).not.toEqual("Success");
  });
});
