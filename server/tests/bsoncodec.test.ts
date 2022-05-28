import { Game, initialGame } from "../src/game"
import { serializeGame, deserializeGame, deserializeTileList, serializeTileList, serialisePositionedTile, deserializePositionedTile } from "../src/bsonCodec"
import { Map, List } from "immutable";
import { OnlineStatus, UserType, UserWithStatus } from "../../shared/User";
import { Position, PositionedTile, Tile, TileColour, TileShape } from "../../shared/Domain";
import { deserializeStream } from "bson";
import { TileBag } from "../src/TileBag";

describe("bsoncodec", () => {

    test("roundtrips a tile list", () => {
        const tl = List.of<Tile>({shape: TileShape.Five, colour: TileColour.Blue});
        expect(deserializeTileList(serializeTileList(tl))).toStrictEqual(tl);
    });

    test("roundtrips positioned tiles", () => {
        const tiles = List.of<PositionedTile>(
            { shape: TileShape.Two, colour: TileColour.Red, position: { x: 0, y: 1 }},
            { shape: TileShape.Three, colour: TileColour.Blue, position: { x: 0, y: 0 }},
        );
        const serialized = serialisePositionedTile(tiles);
        const deserialized = deserializePositionedTile(serialized);
        expect(deserialized).toStrictEqual(tiles);
    });

    test("weirdness with shape 3", () => {
        const tiles = List.of<PositionedTile>({ shape: TileShape.Three, colour: TileColour.Blue, position: { x: 0, y: 0 }});
        const serialized = serialisePositionedTile(tiles);
        const deserialized = deserializePositionedTile(serialized);
        const reserialized = serialisePositionedTile(deserialized);
        const redeserialized = deserializePositionedTile(reserialized);
        expect(redeserialized).toStrictEqual(tiles);
    });

    test("roundtrips a game", () => {
        const user: UserWithStatus = {
            onlineStatus: OnlineStatus.online,
            userType: UserType.Player,
            score: 10,
            userId: "userid",
            username: "username"
        };
        const hand: List<Tile> = List.of({ shape: TileShape.One, colour: TileColour.Red }, { shape: TileShape.Two, colour: TileColour.Blue });
        const hands: Map<string, List<Tile>> = Map([[user.userId, hand]]);

        const users = Map<string, UserWithStatus>([[user.userId, user]])
        const game: Game = {
            ...initialGame,
            users,
            hands,
            lastWrite: 123
        };
        const serialized = serializeGame(game);
        const deserialized = deserializeGame(serialized);
        
        expect(deserialized.hands.size).toBe(game.hands.size);
        expect(deserialized.hands.get(user.userId)).toStrictEqual(hand);
        expect(deserialized.isOver).toBe(game.isOver);
        expect(deserialized.isStarted).toBe(game.isStarted);
        expect(deserialized.lastWrite).toBe(game.lastWrite);
        expect(deserialized.tileBag.count).toBe(TileBag.full().count);
        expect(deserialized.tiles).toStrictEqual    (game.tiles);
        expect(deserialized.tilesLastPlaced).toBe(game.tilesLastPlaced);
        expect(deserialized.turnStartTime).toBe(game.turnStartTime);
        expect(deserialized.turnTimer).toBe(game.turnTimer);
        expect(deserialized.userInControl).toBe(game.userInControl);
        expect(deserialized.users).toStrictEqual(game.users);
    });
});