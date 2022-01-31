"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const User_1 = require("./User");
const app = (0, express_1.default)();
const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
const users = new Map();
io.on("connection", (s) => {
    var userId;
    console.log("a user connected");
    s.on("user.identity", (user) => {
        console.log(`user is ${JSON.stringify(user)}`);
        userId = user.userId;
        users.set(userId, Object.assign(Object.assign({}, user), { onlineStatus: User_1.OnlineStatus.online }));
        io.emit("user.list", [...users.entries()]);
    });
    s.on("disconnect", () => {
        if (userId) {
            const user = users.get(userId);
            if (user) {
                console.log(`${user} disconnected`);
                users.set(userId, Object.assign(Object.assign({}, user), { onlineStatus: User_1.OnlineStatus.offline }));
                io.emit("user.list", [...users.entries()]);
            }
        }
    });
});
server.listen(port);
console.log(`listening on port ${port}`);
//# sourceMappingURL=main.js.map