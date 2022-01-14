"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Network = void 0;
const TileGrid_1 = require("./TileGrid");
class Network {
    socket;
    receivedTileGrid;
    constructor(socket) {
        this.socket = socket;
        console.log("registering tilegrid update event");
        socket.on("connect", () => {
            console.log("connection");
            socket.on("tilegrid.update", this.updateTileGrid);
        });
    }
    updateTileGrid(tileGrid) {
        console.log("storing received tilegrid");
        const tg = TileGrid_1.TileGrid.deserialize(tileGrid);
        this.receivedTileGrid = tg;
    }
    updateState(gameState) {
        if (this.receivedTileGrid) {
            gameState.tileGridApplied = this.receivedTileGrid;
            gameState.tileGridToDisplay = this.receivedTileGrid;
            this.receivedTileGrid = undefined;
            console.log("applied new tile grid");
        }
    }
}
exports.Network = Network;
//# sourceMappingURL=Network.js.map