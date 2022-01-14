import { Socket } from "socket.io-client";
import { PositionedTile } from "./domain";
import { GameState } from "./GameState";
import { TileGrid } from "./TileGrid";

export class Network {
  private receivedTileGrid: TileGrid | undefined;

  constructor(private readonly socket: Socket) {
    console.log("registering tilegrid update event");
    socket.on("connect", () => {
      console.log("connection");
      socket.on("tilegrid.update", this.updateTileGrid);
    });
  }

  private updateTileGrid(tileGrid: string) {
    console.log("storing received tilegrid");
    const tg = TileGrid.deserialize(tileGrid);
    this.receivedTileGrid = tg;
  }

  updateState(gameState: GameState): void {
    if (this.receivedTileGrid) {
      gameState.tileGridApplied = this.receivedTileGrid;
      gameState.tileGridToDisplay = this.receivedTileGrid;
      this.receivedTileGrid = undefined;
      console.log("applied new tile grid");
    }
  }
}
