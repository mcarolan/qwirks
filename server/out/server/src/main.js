"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const immutable_1 = require("immutable");
const socket_io_1 = require("socket.io");
const User_1 = require("../../shared/User");
const TileBag_1 = require("./TileBag");
const app = (0, express_1.default)();
const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
const games = new Map();
function upsert(map, key, initial, f) {
    var _a;
    const v = (_a = map.get(key)) !== null && _a !== void 0 ? _a : initial();
    f(v);
    map.set(key, v);
    return v;
}
function initialGame(gameKey) {
    return {
        gameKey,
        users: new Map(),
        isStarted: false,
        tileBag: TileBag_1.TileBag.full(),
        sockets: new Map(),
        hands: new Map(),
        tiles: [],
        userInControl: undefined,
    };
}
function firstUserInControl(game) {
    return (0, immutable_1.List)(game.users.keys()).sort().first();
}
function nextUserInControl(game) {
    if (!game.userInControl) {
        return undefined;
    }
    const l = (0, immutable_1.List)(game.users.keys()).sort();
    const i = l.indexOf(game.userInControl);
    if (i === -1 || i === l.size - 1) {
        return l.first();
    }
    else {
        return l.get(i + 1);
    }
}
function sendStartingHands(game) {
    var tb = game.tileBag;
    for (const [userId, user] of game.users.entries()) {
        if (user.userType === User_1.UserType.Player) {
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
    var userId;
    var gameKey;
    console.log("a user connected");
    s.on("user.identity", (user, joiningGameKey) => {
        console.log(`user is ${JSON.stringify(user)} in ${joiningGameKey}`);
        userId = user.userId;
        gameKey = joiningGameKey;
        s.join(joiningGameKey);
        upsert(games, gameKey, () => initialGame(joiningGameKey), (g) => {
            g.users.set(user.userId, Object.assign(Object.assign({}, user), { onlineStatus: User_1.OnlineStatus.online, userType: User_1.UserType.Player }));
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
        });
    });
    s.on("game.start", () => {
        const gk = gameKey;
        if (gk) {
            upsert(games, gk, () => initialGame(gk), (g) => {
                if (!g.isStarted) {
                    sendStartingHands(g);
                    g.userInControl = firstUserInControl(g);
                    io.to(gk).emit("user.incontrol", g.userInControl);
                    g.isStarted = true;
                    io.to(gk).emit("game.started");
                }
            });
        }
    });
    s.on("game.applytiles", (tiles) => {
        const gk = gameKey;
        const uid = userId;
        if (gk && uid) {
            upsert(games, gk, () => initialGame(gk), (g) => {
                if (g.userInControl === uid) {
                    g.tiles = g.tiles.concat(tiles);
                    g.userInControl = nextUserInControl(g);
                    io.to(gk).emit("game.tiles", g.tiles);
                    io.to(gk).emit("user.incontrol", g.userInControl);
                }
            });
        }
    });
    s.on("disconnect", () => {
        if (userId && gameKey) {
            const game = games.get(gameKey);
            if (game) {
                const user = game.users.get(userId);
                if (user) {
                    console.log(`${JSON.stringify(user)} disconnected from ${gameKey}`);
                    game.users.set(userId, Object.assign(Object.assign({}, user), { onlineStatus: User_1.OnlineStatus.offline }));
                    io.to(gameKey).emit("user.list", [...game.users.entries()]);
                }
            }
        }
    });
});
server.listen(port);
console.log(`listening on port ${port}`);
//# sourceMappingURL=main.js.map