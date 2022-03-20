import { List } from "immutable";
import { plus } from "../../../shared/Domain";
import { IGameStateUpdater } from "~/game/IGameStateUpdater";
import { GameState } from "~/state/GameState";
import { TileGraphics } from "~/graphics/TileGraphics";
import { TileGridGraphics } from "~/graphics/TileGridGraphics";
import { Fireworks } from "./Fireworks";

export class FireworkUpdater implements IGameStateUpdater {
  constructor(
    private tileGraphics: TileGraphics,
    private tileGrid: TileGridGraphics,
    private fireworks: Fireworks
  ) {}

  update(gameState: GameState): void {
    if (!gameState.fireworkTilePositions.isEmpty()) {
      console.log("fire in the hole");
      const tileOffset = {
        x: this.tileGraphics.tileWidth / 2,
        y: this.tileGraphics.tileHeight / 2,
      };
      const fireFrom = {
        x: gameState.mousePosition.x,
        y: gameState.mousePosition.y,
      };

      gameState.fireworkTilePositions.forEach((tp) => {
        const p = plus(
          this.tileGrid.tilePositionToScreenCoords(tp, gameState),
          tileOffset
        );
        this.fireworks.create(fireFrom, p);
      });
      gameState.fireworkTilePositions = List();
    }

    if (gameState.winner) {
      if (this.fireworks.size < 10) {
        const fireFrom = {
          x: Math.random() * gameState.mainAreaBounds.width,
          y: 0,
        };
        const fireAt = this.fireworks.randomOrigin(gameState.mainAreaBounds);
        this.fireworks.create(fireFrom, fireAt);
      }
    }
  }
}
