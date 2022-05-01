import express from "express";
import http from "http";
import { List, Set } from "immutable";
import { Server } from "socket.io";
import { PositionedTile, Tile } from "../../shared/Domain";
import { User } from "../../shared/User";
import { Game, initialGame } from "./game";
import {
  onApplyTiles,
  onDisconnect,
  onStart,
  onSwap,
  onUpdateUsername,
  onUserJoin,
} from "./logic";
import {
  afterDisconnect,
  afterGameStart,
  afterTilesApplied,
  afterTileSwap,
  afterUserJoin,
  afterUsernameSet,
  OutgoingMessage,
} from "./outgoingmessage";
import { Persistence, redisPersistence } from "./persistence";

function main(persistence: Persistence) {
  const app = express();
  const port = process.env.PORT ?? 3000;

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  const timeouts: Map<string, NodeJS.Timeout> = new Map();

  async function upsert(key: string, f: (v: Game) => Game): Promise<Game> {
    const game = (await persistence.get(key)) ?? initialGame;
    const nextGame = f(game);
    const result = await persistence.persist(key, nextGame);
    console.log(`persistence result for ${key} is ${result}`);
    return nextGame;
  }

  function clock(): number {
    return new Date().getUTCMilliseconds();
  }

  function firstUserInControl(game: Game): string {
    return List(game.users.keys()).sort().first() as string;
  }

  function nextUserInControl(game: Game): string {
    const l = List(game.users.keys()).sort();
    const n = l.find((uid) => !game.userInControl || uid > game.userInControl);
    return n ?? l.first();
  }

  function send(message: OutgoingMessage, gameKey: string) {
    console.log(`sending ${JSON.stringify(message)}`);
    switch (message.type) {
      case "GameOver":
        io.to(gameKey).emit("game.over", message.winningUserId);
        return;
      case "GameStarted":
        io.to(gameKey).emit("game.started", message.turnTimer);
        return;
      case "UpdateTiles":
        io.to(gameKey).emit(
          "game.tiles",
          message.allTiles,
          message.tilesLastPlaced
        );
        return;
      case "UpdateUserHand":
        io.to(gameKey).emit(
          "user.hand",
          message.userId,
          message.hand.toArray()
        );
        return;
      case "UpdateUserInControl":
        io.to(gameKey).emit(
          "user.incontrol",
          message.userInControl,
          message.turnStartTime
        );
        return;
      case "UpdateUserList":
        io.to(gameKey).emit("user.list", message.users);
        return;
    }
  }

  function sendAll(messages: Set<OutgoingMessage>, gameKey: string) {
    for (const message of messages) {
      send(message, gameKey);
    }
  }

  io.on("connection", (s) => {
    var userId: string | undefined;
    var gameKey: string | undefined;
    console.log("a user connected");

    s.on("user.identity", async (user: User, joiningGameKey: string) => {
      gameKey = joiningGameKey;
      userId = user.userId;
      const game = await upsert(joiningGameKey, (game) =>
        onUserJoin(user, game)
      );
      await s.join(joiningGameKey);
      sendAll(afterUserJoin(game, user.userId), joiningGameKey);
    });

    s.on("game.start", async (turnTimer: number | undefined) => {
      const gk = gameKey;
      if (gk) {
        const game = await upsert(gk, (game) =>
          onStart(game, firstUserInControl, clock, turnTimer)
        );
        sendAll(afterGameStart(game), gk);
      }
    });

    s.on("user.setusername", async (newUsername: string) => {
      const gk = gameKey;
      const uid = userId;
      if (gk && uid) {
        const game = await upsert(gk, (game) =>
          onUpdateUsername(uid, game, newUsername)
        );
        sendAll(afterUsernameSet(game), gk);
      }
    });

    s.on("game.swap", async (tiles: Tile[]) => {
      const gk = gameKey;
      const uid = userId;
      if (gk && uid) {
        const game = await upsert(gk, (game) =>
          onSwap(game, uid, List(tiles), nextUserInControl, clock)
        );
        sendAll(afterTileSwap(game, uid), gk);
      }
    });

    s.on("game.applytiles", async (tiles: PositionedTile[]) => {
      const gk = gameKey;
      const uid = userId;

      if (gk && uid) {
        const game = await upsert(gk, (game) =>
          onApplyTiles(game, uid, Set(tiles), nextUserInControl, clock)
        );
        sendAll(afterTilesApplied(game, uid), gk);
      }
    });

    s.on("disconnect", async () => {
      const gk = gameKey;
      const uid = userId;
      if (gk && uid) {
        const game = await upsert(gk, (game) => onDisconnect(uid, game));
        sendAll(afterDisconnect(game), gk);
      }
    });
  });

  server.listen(port);
  console.log(`listening on port ${port}`);
}

redisPersistence()
  .then(main)
  .catch((r) => console.error(`rejected ${r}`));
