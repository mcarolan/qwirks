import { changeUsernameInLocalStorage } from "~/browser/BrowserAPI";
import { IGameStateUpdater } from "~/IGameStateUpdater";
import { Main } from "..";
import { capScale, GameState } from "./GameState";
import { Set as ImmSet } from "immutable";

export class MainComponentStateUpdater implements IGameStateUpdater {
  constructor(private readonly mainComponent: Main) {}

  update(gameState: GameState): void {
    if (this.mainComponent.buttonsClicked.size > 0) {
      gameState.pressedButtonTags = this.mainComponent.buttonsClicked;
      this.mainComponent.buttonsClicked = ImmSet();
    } else {
      gameState.pressedButtonTags = ImmSet();
    }

    if (this.mainComponent.handTilesClicked.length > 0) {
      gameState.panelActiveTileIndicies = gameState.panelActiveTileIndicies.withMutations(
        (m) => {
          for (const i of this.mainComponent.handTilesClicked) {
            if (m.has(i)) {
              m.delete(i);
            } else {
              m.add(i);
            }
          }
        }
      );
      this.mainComponent.handTilesClicked = [];
    }

    const netZoomChange =
      this.mainComponent.zoomInPressed + this.mainComponent.zoomOutPressed * -1;

    if (netZoomChange != 0) {
      gameState.scale = capScale(gameState.scale + netZoomChange * 0.1);
      this.mainComponent.zoomInPressed = 0;
      this.mainComponent.zoomOutPressed = 0;
    }

    if (this.mainComponent.setUsername) {
      gameState.setUsername = this.mainComponent.setUsername;
      gameState.currentUser = {
        ...gameState.currentUser,
        username: this.mainComponent.setUsername,
      };
      changeUsernameInLocalStorage(this.mainComponent.setUsername);
      this.mainComponent.setUsername = undefined;
    }

    gameState.turnTimerSelected = this.mainComponent.selectedTurnTimer;
  }
}
