import { Game } from "./game";
import { Binary, deserialize, Document, Int32, Map, serialize } from "bson";
import { OnlineStatus, UserType, UserWithStatus } from "../../shared/User";
import { deserializeTileBag, serializeTileBag } from "./TileBag";
import { PositionedTile, Tile, TileColour, TileShape } from "../../shared/Domain";
import { List, Map as ImmutableMap } from "immutable";

function serializeOnlineStatus(onlineStatus: OnlineStatus): Int32 {
    return new Int32(onlineStatus == OnlineStatus.offline ? 0 : 1);
}

function deserializeOnlineStatus(value: number): OnlineStatus {
    return value == 0 ? OnlineStatus.offline : OnlineStatus.online;
}

function serializeUserType(userType: UserType): Int32 {
    return new Int32(userType == UserType.Player ? 0 : 1);
}

function deserializeUserType(value: number): UserType {
    return value == 0 ? UserType.Player : UserType.Spectator;
}

function serializeTileColour(tileColour: TileColour): number {
    switch (tileColour) {
        case TileColour.Blue:
            return 0;
        case TileColour.Green:
            return 1;
        case TileColour.Orange:
            return 2;
        case TileColour.Purple:
            return 3;
        case TileColour.Red:
            return 4;
        case TileColour.Yellow:
            return 5;
    }
}

function deserializeTileColour(value: number): TileColour {
    switch (value) {
        case 0:
            return TileColour.Blue;
        case 1:
            return TileColour.Green;
        case 2:
            return TileColour.Orange;
        case 3:
            return TileColour.Purple;
        case 4:
            return TileColour.Red;
        case 5:
            return TileColour.Yellow;
        default:
            return TileColour.Blue;
    }
}

function serializeTileShape(tileShape: TileShape): number {
    switch (tileShape) {
        case TileShape.One:
            return 0;
        case TileShape.Two:
            return 1;
        case TileShape.Three:
            return 2;
        case TileShape.Four:
            return 3;
        case TileShape.Five:
            return 4;
        case TileShape.Six:
            return 5;
    }
}

function deserializeTileShape(value: number): TileShape {
    switch (value) {
        case 0:
            return TileShape.One;
        case 1:
            return TileShape.Two;
        case 2:
            return TileShape.Three;
        case 3:
            return TileShape.Four;
        case 4:
            return TileShape.Five;
        case 5:
            return TileShape.Six;
        default:
            return TileShape.One;
    }
}

function serializeUserWithStatus(userWithStatus: UserWithStatus): Document {
    return {
        o: serializeOnlineStatus(userWithStatus.onlineStatus),
        t: serializeUserType(userWithStatus.userType),
        s: new Int32(userWithStatus.score),
        i: userWithStatus.userId,
        n: userWithStatus.username
    };
}

function deserializeUserWithStatus(document: Document): UserWithStatus {
    return {
        onlineStatus: deserializeOnlineStatus(document.o as number),
        userType: deserializeUserType(document.t as number),
        score: document.s as number,
        userId: (document.i as string),
        username: (document.n as string)
    };
}

export function serializeTileList(tiles: List<Tile>): Buffer {
    const arr: number[] = [];
    tiles.forEach((t) => {
        arr.push(serializeTileColour(t.colour));
        arr.push(serializeTileShape(t.shape));
    });
    return Buffer.from(Uint8Array.from(arr));
}

export function deserializeTileList(buffer: Buffer): List<Tile> {
    const values = new Uint8Array(buffer);
    const result: Tile[] = [];
    for (var i = 0; i < values.length; i += 2) {
        const colour: TileColour = deserializeTileColour(values[i]);
        const shape: TileShape = deserializeTileShape(values[i + 1]);
        result.push({colour, shape});
    }
    return List(result);
}

export function serialisePositionedTile(tiles: List<PositionedTile>): Buffer {
    const arr: number[] = [];
    tiles.forEach((t) => {
        arr.push(serializeTileColour(t.colour));
        arr.push(serializeTileShape(t.shape));
        arr.push(t.position.x);
        arr.push(t.position.y);
    });
    return Buffer.from(new Int8Array(arr));
}

export function deserializePositionedTile(buffer: Buffer): List<PositionedTile> {
    const values = new Int8Array(buffer);
    const result: PositionedTile[] = [];
    for (var i = 0; i < values.length; i += 4) {
        const colour: TileColour = deserializeTileColour(values[i]);
        const shape: TileShape = deserializeTileShape(values[i + 1]);
        const x: number = values[i + 2];
        const y: number = values[i + 3];
        result.push({colour, shape, position: { x, y }});
    }
    return List(result);
}

export function serializeTurnStartTime(value: number | undefined): Int32 {
    return new Int32(value ? value : -1);
}

export function deserializeTurnStartTime(value: Int32): number | undefined {
    return value.value == -1 ? undefined : value.value;
}

export function serializeGame(game: Game): Buffer {
    return serialize({
        u: new Map<string, Document>(game.users.map((v) => serializeUserWithStatus(v)).toArray()),
        s: game.isStarted,
        o: game.isOver,
        t: new Binary(serializeTileBag(game.tileBag)),
        h: new Map<string, Binary>(game.hands.map((v) => new Binary(serializeTileList(v))).toArray()),
        x: new Binary(serialisePositionedTile(List(game.tiles))),
        y: new Binary(serialisePositionedTile(game.tilesLastPlaced.toList())),
        c: game.userInControl,
        n: serializeTurnStartTime(game.turnStartTime),
        l: serializeTurnStartTime(game.turnTimer),
        w: new Int32(game.lastWrite)
    });
}

export function deserializeGame(buffer: Buffer): Game {
    const document = deserialize(buffer);

    const users = Object.entries<Document>(document.u);
    const deserializedUsers: List<[string, UserWithStatus]> = List(users.map(([k, v]) => [k, deserializeUserWithStatus(v)]));

    const hands = Object.entries<Binary>(document.h);
    const deserializedHands: List<[string, List<Tile>]> = List(hands.map(([k, v]) => [k, deserializeTileList(v.buffer)]));

    return {
        users: ImmutableMap(deserializedUsers),
        isStarted: document.s as boolean,
        isOver: document.o as boolean,
        tileBag: deserializeTileBag((document.t as Binary).buffer),
        hands: ImmutableMap(deserializedHands),
        tiles: deserializePositionedTile((document.x as Binary).buffer),
        tilesLastPlaced: deserializePositionedTile((document.y as Binary).buffer).toSet(),
        userInControl: document.c as string,
        turnStartTime: deserializeTurnStartTime(document.n as Int32),
        turnTimer: deserializeTurnStartTime(document.l as Int32),
        lastWrite: document.w as number
    };
}