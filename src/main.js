"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var http_1 = __importDefault(require("http"));
var socket_io_1 = require("socket.io");
var app = express_1["default"]();
var port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000;
var server = http_1["default"].createServer(app);
var io = new socket_io_1.Server(server);
app.use(express_1["default"].static("./dist"));
io.on("connection", function (s) {
    console.log("a user connected");
    s.on("disconnect", function () {
        console.log("user disconnected");
    });
});
server.listen(port);
console.log("listening on port " + port);
