"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var http_1 = __importDefault(require("http"));
var socket_io_1 = require("socket.io");
var unique_username_generator_1 = require("unique-username-generator");
var app = express_1["default"]();
var port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000;
var server = http_1["default"].createServer(app);
var io = new socket_io_1.Server(server);
app.use(express_1["default"].static("./dist"));
var usernames = new Map();
function randomUsername() {
    return unique_username_generator_1.generateUsername(" ");
}
io.on("connection", function (s) {
    var userId;
    console.log("a user connected");
    s.on("user.identity", function (uid, uname) {
        console.log("user id is " + uid + ", username " + uname);
        userId = uid;
        if (!usernames.has(uid)) {
            usernames.set(uid, randomUsername());
        }
        s.emit("user.username", usernames.get(uid));
        io.emit("user.list", __spread(usernames.entries()));
    });
    s.on("disconnect", function () {
        console.log("user disconnected");
    });
});
server.listen(port);
console.log("listening on port " + port);
