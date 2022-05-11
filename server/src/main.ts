import express from "express";
import http from "http";
import { List, Set } from "immutable";
import { Server } from "socket.io";
import { PositionedTile, Tile } from "../../shared/Domain";
import { User, UserType } from "../../shared/User";
import { Game, initialGame } from "./game";
import { Lobby } from "./lobby";
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
  afterLobbyChange,
  afterTilesApplied,
  afterTileSwap,
  afterUserJoin,
  afterUsernameSet,
  OutgoingMessage,
} from "./outgoingmessage";
import { dummyPersistence, Persistence, redisPersistence } from "./persistence";

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

  const lobby = new Lobby();

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
    return List(game.users.filter((u) => u.userType === UserType.Player).keys()).sort().first() as string;
  }

  function nextUserInControl(game: Game): string {
    const l = List(game.users.filter((u) => u.userType === UserType.Player).keys()).sort();
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
      await s.join(joiningGameKey);

      if (await persistence.hasGameStarted(gameKey)) {
        const game = await upsert(joiningGameKey, (game) =>
          onUserJoin(user, game)
        );
        sendAll(afterUserJoin(game, user.userId), joiningGameKey);
      }
      else {
        const users = lobby.onUserJoin(user, gameKey);
        sendAll(afterLobbyChange(users), joiningGameKey);
      }
    });

    s.on("game.start", async (turnTimer: number | undefined) => {
      const gk = gameKey;
      if (gk) {
        const users = lobby.clearLobby(gk);
        const game = onStart(users, firstUserInControl, clock, turnTimer)
        await persistence.persist(gk, game);
        sendAll(afterGameStart(game), gk);
      }
    });

    s.on("user.setusername", async (newUsername: string) => {
      const gk = gameKey;
      const uid = userId;
      if (gk && uid) {
        if (!(await persistence.hasGameStarted(gk))) {
          const users = lobby.onUserChangeName(uid, gk, newUsername);
          sendAll(afterLobbyChange(users), gk);
        }
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
        if (await persistence.hasGameStarted(gk)) {
          const game = await upsert(gk, (game) => onDisconnect(uid, game));
          sendAll(afterDisconnect(game), gk);
        }
        else {
          const users = lobby.onUserDisconnect(uid, gk);
          sendAll(afterLobbyChange(users), gk);
        }
      }
    });
  });

  server.listen(port);
  console.log(`listening on port ${port}`);
}

const args = Set(process.argv.slice(2));
const perisistence: Promise<Persistence> =
  args.contains("--dummy-persistence") ? dummyPersistence() : redisPersistence();

perisistence
  .then(main)
  .catch((r) => console.error(`rejected ${r}`));
