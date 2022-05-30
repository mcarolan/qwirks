import { List } from "immutable"
import { Tile, TileColour, TileShape } from "../../shared/Domain"
import { deserializeTileBag, serializeTileBag, TileBag } from "../src/TileBag"

describe("tilebag", () => {
    test("roundtrips a tile bag", () => {
        const blueOne: Tile = { colour: TileColour.Blue, shape: TileShape.One };
        const greenOne: Tile = { colour: TileColour.Green, shape: TileShape.One };
        const tb = new TileBag(List.of<Tile>(blueOne, greenOne, blueOne));
        const serialized = serializeTileBag(tb);
        expect(serialized.buffer.byteLength).toBe(36);
        const dtb = deserializeTileBag(serialized);
        expect(dtb.contents.size).toBe(3);
        expect(dtb.count(blueOne)).toBe(2);
        expect(dtb.count(greenOne)).toBe(1);
    });

    test("roundtrips a full tile bag", () => {
        const serialized = serializeTileBag(TileBag.full());
        expect(serialized.buffer.byteLength).toBe(36);
        const dtb = deserializeTileBag(serialized);
        expect(dtb.contents.size).toBe(36 * 3);
    })

    test("try to break things", () => {
        const full = TileBag.full()
        const s = serializeTileBag(full);
        const s2 = serializeTileBag(deserializeTileBag(s));
        expect(full.count({ colour: TileColour.Blue, shape: TileShape.Five })).toBe(3);
        expect(deserializeTileBag(s).count({ colour: TileColour.Blue, shape: TileShape.Five })).toBe(3);
        expect(s).toStrictEqual(s2);
    });
});