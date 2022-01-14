"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const TileGrid_1 = require("./tiles/TileGrid");
const immutable_1 = require("immutable");
const domain_1 = require("./tiles/domain");
const app = (0, express_1.default)();
const port = process.env.PORT ?? 3000;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
const tg = TileGrid_1.TileGrid.empty().place(immutable_1.Set.of(new domain_1.PositionedTile(new domain_1.Tile(domain_1.TileColour.Red, domain_1.TileShape.One), new domain_1.Position(0, 0))));
app.use(express_1.default.static("./dist"));
io.on("connection", (s) => {
    console.log("a user connected");
    s.emit("tilegrid.update", tg.tileGrid.serialize());
    s.on("disconnect", () => {
        console.log("user disconnected");
    });
});
server.listen(port);
console.log(`listening on port ${port}`);
//# sourceMappingURL=main.js.map