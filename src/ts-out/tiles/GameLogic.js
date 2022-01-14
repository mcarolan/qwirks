"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameLogic = void 0;
const domain_1 = require("./domain");
const immutable_1 = require("immutable");
const index_1 = require("../index");
function isValidPlacement(gameState, placements) {
    const newTg = gameState.tileGridApplied.place(placements);
    if (newTg) {
        switch (newTg.type) {
            case "Success":
                gameState.currentPlacement.tileGrid = newTg.tileGrid;
                gameState.currentPlacement.score = newTg.score;
                gameState.currentPlacement.lines = newTg.lines;
                return true;
            default:
                console.log(`oh no, can't do that: ${(0, domain_1.prettyPrint)(newTg)}`);
                break;
        }
    }
    else {
        console.log("newTg or tileGridGraphics is null");
    }
    return false;
}
class GameLogic {
    static updateGameState(gameState) {
        const singleActiveTile = gameState.panelActiveTileIndicies.first();
        if (singleActiveTile != undefined) {
            const activeTile = gameState.hand.get(singleActiveTile);
            if (activeTile) {
                gameState.tilePositionsPressed.forEach((p) => {
                    const newPlacement = gameState.currentPlacement.tiles.add(new domain_1.PositionedTile(activeTile, p));
                    if (isValidPlacement(gameState, newPlacement)) {
                        const newHand = gameState.hand.remove(singleActiveTile);
                        gameState.panelActiveTileIndicies = immutable_1.Set.of();
                        gameState.hand = newHand;
                        gameState.currentPlacement.tiles = newPlacement;
                    }
                });
            }
        }
        if (gameState.pressedButtonTags.contains(index_1.acceptButton.tag)) {
            gameState.tileGridApplied = gameState.currentPlacement.tileGrid;
            const toTake = gameState.currentPlacement.tiles.size;
            const [toAdd, newBag] = gameState.tileBag.take(toTake);
            gameState.hand = gameState.hand.concat(toAdd);
            gameState.tileBag = newBag;
            gameState.score = gameState.score + gameState.currentPlacement.score;
            gameState.scoreJustAchieved = gameState.currentPlacement.score;
            gameState.fireworkTilePositions = gameState.currentPlacement.lines
                .flatMap((line) => line.map((pt) => pt.position))
                .toList();
            gameState.currentPlacement.score = 0;
            gameState.currentPlacement.tiles = immutable_1.Set.of();
        }
        else if (gameState.pressedButtonTags.contains(index_1.swapButton.tag) &&
            !gameState.panelActiveTileIndicies.isEmpty()) {
            const [toAdd, newBag] = gameState.tileBag.take(gameState.panelActiveTileIndicies.size);
            const newHand = gameState.hand
                .filterNot((_, i) => gameState.panelActiveTileIndicies.contains(i))
                .concat(toAdd);
            gameState.hand = newHand;
            gameState.tileBag = newBag;
            gameState.panelActiveTileIndicies = immutable_1.Set.of();
        }
        else if (gameState.pressedButtonTags.contains(index_1.cancelButton.tag) &&
            !gameState.currentPlacement.tiles.isEmpty()) {
            const newHand = gameState.hand.concat(gameState.currentPlacement.tiles.map((p) => p.tile));
            gameState.hand = newHand;
            gameState.currentPlacement.tileGrid = gameState.tileGridApplied;
            gameState.currentPlacement.tiles = immutable_1.Set.of();
        }
        const placementButtonsEnabled = !gameState.currentPlacement.tiles.isEmpty();
        gameState.setButtonEnabled(index_1.acceptButton.tag, placementButtonsEnabled);
        gameState.setButtonEnabled(index_1.cancelButton.tag, placementButtonsEnabled);
        gameState.setButtonEnabled(index_1.swapButton.tag, !gameState.panelActiveTileIndicies.isEmpty() &&
            gameState.currentPlacement.tiles.isEmpty());
        gameState.tileGridToDisplay = gameState.currentPlacement.tiles.isEmpty()
            ? gameState.tileGridApplied
            : gameState.currentPlacement.tileGrid;
    }
}
exports.GameLogic = GameLogic;
//# sourceMappingURL=GameLogic.js.map