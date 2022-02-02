import express from "express";
import http from "http";
import { List } from "immutable";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { PositionedTile, Tile } from "../../shared/Domain";
import {
  OnlineStatus,
  User,
  UserType,
  UserWithStatus,
} from "../../shared/User";
import { TileBag } from "./TileBag";

const app = express();
const port = process.env.PORT ?? 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

interface Game {
  gameKey: string;
  users: Map<string, UserWithStatus>;
  isStarted: boolean;
  tileBag: TileBag;
  sockets: Map<
    string,
    Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
  >;
  hands: Map<string, List<Tile>>;
  tiles: PositionedTile[];
  userInControl: string | undefined;
}
const games = new Map<string, Game>();

function upsert<K, V>(
  map: Map<K, V>,
  key: K,
  initial: () => V,
  f: (v: V) => void
): V {
  const v: V = map.get(key) ?? initial();
  f(v);
  map.set(key, v);
  return v;
}

function initialGame(gameKey: string): Game {
  return {
    gameKey,
    users: new Map(),
    isStarted: false,
    tileBag: TileBag.full(),
    sockets: new Map(),
    hands: new Map(),
    tiles: [],
    userInControl: undefined,
  };
}

function firstUserInControl(game: Game): string | undefined {
  return List(game.users.keys()).sort().first();
}

function nextUserInControl(game: Game): string | undefined {
  if (!game.userInControl) {
    return undefined;
  }
  const l = List(game.users.keys()).sort();
  const i = l.indexOf(game.userInControl);

  if (i === -1 || i === l.size - 1) {
    return l.first();
  } else {
    return l.get(i + 1);
  }
}

function sendStartingHands(game: Game) {
  var tb = game.tileBag;
  for (const [userId, user] of game.users.entries()) {
    if (user.userType === UserType.Player) {
      const socket = game.sockets.get(userId);
      if (socket) {
        const [hand, nextTb] = tb.take(6);
        console.log(`${hand} tp ${userId}`);
        game.hands.set(userId, hand);
        socket.emit("user.hand", hand.toArray());
        tb = nextTb;
      }
    }
  }
  game.tileBag = tb;
}

io.on("connection", (s) => {
  var userId: string | undefined;
  var gameKey: string | undefined;
  console.log("a user connected");

  s.on("user.identity", (user: User, joiningGameKey: string) => {
    console.log(`user is ${JSON.stringify(user)} in ${joiningGameKey}`);
    userId = user.userId;
    gameKey = joiningGameKey;

    s.join(joiningGameKey);
    upsert(
      games,
      gameKey,
      () => initialGame(joiningGameKey),
      (g) => {
        g.users.set(user.userId, {
          ...user,
          onlineStatus: OnlineStatus.online,
          userType: UserType.Player,
        });
        g.sockets.set(user.userId, s);

        if (g.isStarted) {
          s.emit("game.started");
        }

        if (g.userInControl) {
          s.emit("user.incontrol", g.userInControl);
        }

        if (g.tiles.length > 0) {
          s.emit("game.tiles", g.tiles);
        }

        const hand = g.hands.get(user.userId);
        if (hand) {
          s.emit("user.hand", hand.toArray());
        }

        io.to(joiningGameKey).emit("user.list", [...g.users.entries()]);
      }
    );
  });

  s.on("game.start", () => {
    const gk = gameKey;
    if (gk) {
      upsert(
        games,
        gk,
        () => initialGame(gk),
        (g) => {
          if (!g.isStarted) {
            sendStartingHands(g);
            g.userInControl = firstUserInControl(g);
            io.to(gk).emit("user.incontrol", g.userInControl);
            g.isStarted = true;
            io.to(gk).emit("game.started");
          }
        }
      );
    }
  });

  s.on("game.applytiles", (tiles: PositionedTile[]) => {
    const gk = gameKey;
    const uid = userId;

    if (gk && uid) {
      upsert(
        games,
        gk,
        () => initialGame(gk),
        (g) => {
          if (g.userInControl === uid) {
            g.tiles = g.tiles.concat(tiles);
            g.userInControl = nextUserInControl(g);
            io.to(gk).emit("game.tiles", g.tiles);
            io.to(gk).emit("user.incontrol", g.userInControl);
          }
        }
      );
    }
  });

  s.on("disconnect", () => {
    if (userId && gameKey) {
      const game = games.get(gameKey);
      if (game) {
        const user = game.users.get(userId);

        if (user) {
          console.log(`${JSON.stringify(user)} disconnected from ${gameKey}`);
          game.users.set(userId, {
            ...user,
            onlineStatus: OnlineStatus.offline,
          });
          io.to(gameKey).emit("user.list", [...game.users.entries()]);
        }
      }
    }
  });
});

server.listen(port);
console.log(`listening on port ${port}`);
