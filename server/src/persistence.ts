import { commandOptions, RedisClientType, WatchError } from "@node-redis/client";
import BSON from "bson";
import { List, Set, Map } from "immutable";
import { createClient } from "redis";
import { Position, PositionedTile, Tile, TileColour, TileShape } from "../../shared/Domain";
import { UserWithStatus } from "../../shared/User";
import { deserializeGame, serializeGame } from "./bsonCodec";
import { Game, initialGame } from "./game";
import { deserializeTileBag, serializeTileBag, TileBag } from "./TileBag";

const redis_host = process.env.REDIS_HOST ?? "redis";

export interface Persistence {
  persist(gameKey: string, game: Game): Promise<[boolean, number?]>;
  get(gameKey: string): Promise<Game | null>;
  hasGameStarted(gameKey: string): Promise<boolean>;
}

class DummyPersistence implements Persistence {

  private games: Map<string, Game> = Map();
  private tileBags: Map<string, Uint8Array> = Map();

  hasGameStarted(gameKey: string): Promise<boolean> {
    const game = this.games.get(gameKey);
    return Promise.resolve(game ? game.isStarted : false);
  }

  persist(gameKey: string, game: Game): Promise<[boolean, number?]> {
    this.tileBags = this.tileBags.set(gameKey, serializeTileBag(game.tileBag));
    this.games = this.games.set(gameKey, game);
    return Promise.resolve([true, Date.now()]);
  }

  get(gameKey: string): Promise<Game | null> {
    const game = this.games.get(gameKey);
    const tileBag = this.tileBags.get(gameKey);

    if (game && tileBag) {
      return Promise.resolve({...game, tileBag: deserializeTileBag(tileBag)});
    }
    else {
      return Promise.resolve(null);
    }
  }
  
}

class RedisPersistence implements Persistence {
  constructor(private readonly client: RedisClientType) {}

  private readonly keyLastWrite = "w";
  private readonly keyState = "s";

  private async readGame(
    client: RedisClientType,
    gameKey: string
  ): Promise<Game> {
    const buffer = await client.hGet(commandOptions({returnBuffers: true}), gameKey, this.keyState)
    if (buffer) {
      return deserializeGame(buffer);
    }
    else {
      console.log("woah, null buffer");
      return Promise.reject(`Wowzer, couldn't read state for ${gameKey}`);
    }
  }
  
  async hasGameStarted(gameKey: string): Promise<boolean> {
    const state = await this.client.hGet(gameKey, this.keyState);

    if (state) {
      return true;
    }
    else {
      return false;
    }
  }

  async get(gameKey: string): Promise<Game | null> {
    return await this.client.executeIsolated(async (isolatedClient) => {
      await isolatedClient.watch(this.keyLastWrite);

      const lastWrite = await isolatedClient.hGet(gameKey, this.keyLastWrite);

      if (lastWrite) {
        const res = await this.readGame(isolatedClient, gameKey);
        await isolatedClient.multi().ping().exec();
        return { ...res, lastWrite: Number(lastWrite) };
      }
      else {
        console.log("woah, no last write");
        await isolatedClient.unwatch();
        return null;
      }
    });
  }

  async persist(gameKey: string, game: Game): Promise<[boolean, number?]> {
    return await this.client.executeIsolated(async (isolatedClient) => {
      await isolatedClient.watch(gameKey);

      const lastWrite = await isolatedClient.hGet(gameKey, this.keyLastWrite);

      if (Number(lastWrite) !== game.lastWrite) {
        console.log(`wowzer, last write didn't match ${lastWrite} and ${game.lastWrite}`)
        await isolatedClient.unwatch();
        return [false, undefined];
      }

      const buffer = serializeGame(game);

      const thisWrite: number = Date.now();
      const transaction = isolatedClient
        .multi()
        .hSet(gameKey, this.keyLastWrite, thisWrite)
        .hSet(gameKey, this.keyState, buffer);

      try {
        await transaction.exec();
        return [true, thisWrite];
      } catch (err) {
        if (err instanceof WatchError) {
          return [false, undefined];
        } else {
          throw err;
        }
      }
    });
  }
}

export async function redisPersistence(): Promise<Persistence> {
  console.log("starting with redis persistence");
  const client: RedisClientType = createClient({
    url: `redis://${redis_host}:6379`,
  });
  await client.connect();
  return new RedisPersistence(client);
}

export async function dummyPersistence(): Promise<Persistence> {
  console.log("starting with dummy persistence");
  return Promise.resolve(new DummyPersistence);
}