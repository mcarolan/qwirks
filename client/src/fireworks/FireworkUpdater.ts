import { List } from "immutable";
import { plus } from "../../../shared/Domain";
import { GameState } from "~/state/GameState";
import { TileGraphics } from "~/graphics/TileGraphics";
import { Fireworks } from "./Fireworks";
import { MouseState } from "../game/Mouse";

export class FireworkUpdater {
  constructor(
    private tileGraphics: TileGraphics,
    private fireworks: Fireworks
  ) {}

  update(gameState: GameState, mouseState: MouseState): void {
    if (!gameState.fireworkTilePositions.isEmpty()) {
      console.log("fire in the hole");
      const tileOffset = {
        x: this.tileGraphics.tileWidth / 2,
        y: this.tileGraphics.tileHeight / 2,
      };
      const fireFrom = {
        x: mouseState.mousePosition.x,
        y: mouseState.mousePosition.y,
      };

      gameState.fireworkTilePositions.forEach((tp) => {
        const p = plus(this.tileGraphics.screenCoords(tp, mouseState), tileOffset);
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
