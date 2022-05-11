import { RedisClientType, WatchError } from "@node-redis/client";
import { List, Set, Map } from "immutable";
import { createClient } from "redis";
import { Position, PositionedTile, Tile, TileColour, TileShape } from "../../shared/Domain";
import { UserWithStatus } from "../../shared/User";
import { Game, initialGame } from "./game";
import { TileBag } from "./TileBag";

const redis_host = process.env.REDIS_HOST ?? "localhost";

export interface Persistence {
  persist(gameKey: string, game: Game): Promise<boolean>;
  get(gameKey: string): Promise<Game | null>;
  hasGameStarted(gameKey: string): Promise<boolean>;
}

class DummyPersistence implements Persistence {

  private tiles: Array<PositionedTile> = [
    {
      position: { x: 0, y: 0 },
      shape: TileShape.One,
      colour: TileColour.Blue
    },
    {
      position: { x: 0, y: 1 },
      shape: TileShape.Two,
      colour: TileColour.Red
    },
    {
      position: { x: 0, y: 2 },
      shape: TileShape.Three,
      colour: TileColour.Green
    },
    {
      position: { x: 0, y: 3 },
      shape: TileShape.Four,
      colour: TileColour.Orange
    },
    {
      position: { x: 0, y: 4 },
      shape: TileShape.Five,
      colour: TileColour.Yellow
    },
    {
      position: { x: 0, y: 5 },
      shape: TileShape.Six,
      colour: TileColour.Purple
    },
  ];

  private games: Map<string, Game> = Map();

  hasGameStarted(gameKey: string): Promise<boolean> {
    const game = this.games.get(gameKey);
    return Promise.resolve(game ? game.isStarted : false);
  }

  persist(gameKey: string, game: Game): Promise<boolean> {
    this.games = this.games.set(gameKey, game);
    return Promise.resolve(true);
  }

  get(gameKey: string): Promise<Game | null> {
    return Promise.resolve(this.games.get(gameKey) ?? null);
  }
  
}

class RedisPersistence implements Persistence {
  constructor(private readonly client: RedisClientType) {}

  private keyLastWrite(gameKey: string): string {
    return `${gameKey}_last_write`;
  }

  private keyUsers(gameKey: string): string {
    return `${gameKey}_users`;
  }

  private keyIsStarted(gameKey: string): string {
    return `${gameKey}_is_started`;
  }

  private keyIsOver(gameKey: string): string {
    return `${gameKey}_is_over`;
  }

  private keyTileBag(gameKey: string): string {
    return `${gameKey}_tile_bag`;
  }

  private keyHands(gameKey: string): string {
    return `${gameKey}_hands`;
  }

  private keyTiles(gameKey: string): string {
    return `${gameKey}_tiles`;
  }

  private keyTilesLastPlaced(gameKey: string): string {
    return `${gameKey}_tiles_last_placed`;
  }

  private keyUserInControl(gameKey: string): string {
    return `${gameKey}_user_in_control`;
  }

  private keyTurnStartTime(gameKey: string): string {
    return `${gameKey}_turn_start_time`;
  }

  private keyTurnTimer(gameKey: string): string {
    return `${gameKey}_turn_timer`;
  }

  private async readArray<T>(
    client: RedisClientType,
    key: string
  ): Promise<Array<T>> {
    const value = await client.get(key);
    return value ? JSON.parse(value) : [];
  }

  private async readBool(
    client: RedisClientType,
    key: string
  ): Promise<boolean> {
    const value = await client.get(key);
    return value ? JSON.parse(value) : false;
  }

  private async readString(
    client: RedisClientType,
    key: string
  ): Promise<string> {
    const value = await client.get(key);
    return value ? JSON.parse(value) : "";
  }

  private async readOptionalNumber(
    client: RedisClientType,
    key: string
  ): Promise<number | undefined> {
    const value = await client.get(key);
    return value ? (JSON.parse(value) as number) : undefined;
  }

  private async readGame(
    client: RedisClientType,
    gameKey: string,
    lastWrite: number
  ): Promise<Game> {
    return {
      users: Map(
        await this.readArray<[string, UserWithStatus]>(
          client,
          this.keyUsers(gameKey)
        )
      ),
      isStarted: await this.readBool(client, this.keyIsStarted(gameKey)),
      isOver: await this.readBool(client, this.keyIsOver(gameKey)),
      tileBag: new TileBag(
        List(await this.readArray<Tile>(client, this.keyTileBag(gameKey)))
      ),
      hands: Map(
        (
          await this.readArray<[string, Tile[]]>(client, this.keyHands(gameKey))
        ).map(([userId, tiles]) => [userId, List(tiles)])
      ),
      tiles: await this.readArray<PositionedTile>(
        client,
        this.keyTiles(gameKey)
      ),
      tilesLastPlaced: Set(
        await this.readArray<PositionedTile>(
          client,
          this.keyTilesLastPlaced(gameKey)
        )
      ),
      userInControl: await this.readString(
        client,
        this.keyUserInControl(gameKey)
      ),
      turnStartTime: await this.readOptionalNumber(
        client,
        this.keyTurnStartTime(gameKey)
      ),
      turnTimer: await this.readOptionalNumber(
        client,
        this.keyTurnTimer(gameKey)
      ),
      lastWrite,
    };
  }


  async hasGameStarted(gameKey: string): Promise<boolean> {
    return this.readBool(this.client, this.keyIsStarted(gameKey));
  }

  async get(gameKey: string): Promise<Game | null> {
    return await this.client.executeIsolated(async (isolatedClient) => {
      await isolatedClient.watch(this.keyLastWrite(gameKey));

      const lastWrite = await this.readOptionalNumber(
        isolatedClient,
        this.keyLastWrite(gameKey)
      );

      if (lastWrite == undefined) {
        await isolatedClient.unwatch();
        return null;
      } else {
        const res = await this.readGame(isolatedClient, gameKey, lastWrite);
        await isolatedClient.multi().ping().exec();
        return res;
      }
    });
  }

  async persist(gameKey: string, game: Game): Promise<boolean> {
    return await this.client.executeIsolated(async (isolatedClient) => {
      await isolatedClient.watch(this.keyLastWrite(gameKey));

      const lastWrite = await isolatedClient.get(this.keyLastWrite(gameKey));

      if (Number(lastWrite) !== game.lastWrite) {
        await isolatedClient.unwatch();
        return false;
      }

      const thisWrite = Date.now();
      console.log(`persist ${JSON.stringify(game.tiles)}`);
      const transaction = isolatedClient
        .multi()
        .set(this.keyLastWrite(gameKey), thisWrite)
        .set(this.keyUsers(gameKey), JSON.stringify([...game.users.entries()]))
        .set(this.keyIsStarted(gameKey), JSON.stringify(game.isStarted))
        .set(this.keyIsOver(gameKey), JSON.stringify(game.isOver))
        .set(
          this.keyTileBag(gameKey),
          JSON.stringify([...game.tileBag.contents.toArray()])
        )
        .set(this.keyHands(gameKey), JSON.stringify([...game.hands.entries()]))
        .set(this.keyTiles(gameKey), JSON.stringify(game.tiles))
        .set(
          this.keyTilesLastPlaced(gameKey),
          JSON.stringify([...game.tilesLastPlaced.entries()])
        )
        .set(this.keyUserInControl(gameKey), JSON.stringify(game.userInControl))
        .set(this.keyTurnStartTime(gameKey), JSON.stringify(game.turnStartTime))
        .set(this.keyTurnTimer(gameKey), JSON.stringify(game.turnTimer));

      try {
        await transaction.exec();
        return true;
      } catch (err) {
        if (err instanceof WatchError) {
          return false;
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