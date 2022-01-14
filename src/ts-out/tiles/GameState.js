"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameState = exports.CurrentPlacementState = void 0;
const immutable_1 = require("immutable");
const domain_1 = require("./domain");
const TileBag_1 = require("./TileBag");
const TileGrid_1 = require("./TileGrid");
class CurrentPlacementState {
    tiles;
    tileGrid;
    score;
    lines;
    constructor(tiles, tileGrid, score, lines) {
        this.tiles = tiles;
        this.tileGrid = tileGrid;
        this.score = score;
        this.lines = lines;
    }
}
exports.CurrentPlacementState = CurrentPlacementState;
class GameState {
    hand;
    tileBag;
    canvasRect;
    tileGridToDisplay;
    tileGridApplied;
    mousePosition;
    mouseEvents;
    tilePositionsPressed;
    pressedButtonTags;
    enabledButtonTags;
    panelActiveTileIndicies;
    score;
    scoreJustAchieved;
    fireworkTilePositions;
    currentPlacement;
    mouseDragInProgress;
    panelHoverTileIndex;
    constructor(hand, tileBag, canvasRect, tileGridToDisplay, tileGridApplied, mousePosition, mouseEvents, tilePositionsPressed, pressedButtonTags, enabledButtonTags, panelActiveTileIndicies, score, scoreJustAchieved, fireworkTilePositions, currentPlacement, mouseDragInProgress, panelHoverTileIndex) {
        this.hand = hand;
        this.tileBag = tileBag;
        this.canvasRect = canvasRect;
        this.tileGridToDisplay = tileGridToDisplay;
        this.tileGridApplied = tileGridApplied;
        this.mousePosition = mousePosition;
        this.mouseEvents = mouseEvents;
        this.tilePositionsPressed = tilePositionsPressed;
        this.pressedButtonTags = pressedButtonTags;
        this.enabledButtonTags = enabledButtonTags;
        this.panelActiveTileIndicies = panelActiveTileIndicies;
        this.score = score;
        this.scoreJustAchieved = scoreJustAchieved;
        this.fireworkTilePositions = fireworkTilePositions;
        this.currentPlacement = currentPlacement;
        this.mouseDragInProgress = mouseDragInProgress;
        this.panelHoverTileIndex = panelHoverTileIndex;
    }
    setButtonEnabled(tag, isEnabled) {
        if (isEnabled)
            this.enabledButtonTags = this.enabledButtonTags.add(tag);
        else
            this.enabledButtonTags = this.enabledButtonTags.remove(tag);
    }
    setButtonPressed(tag, isPressed) {
        if (isPressed)
            this.pressedButtonTags = this.pressedButtonTags.add(tag);
        else
            this.pressedButtonTags = this.pressedButtonTags.remove(tag);
    }
    setPanelTileActive(index, isActive) {
        if (isActive)
            this.panelActiveTileIndicies = this.panelActiveTileIndicies.add(index);
        else
            this.panelActiveTileIndicies = this.panelActiveTileIndicies.remove(index);
    }
    static initial(canvasRect) {
        const tgResult = TileGrid_1.TileGrid.empty();
        var [hand, tileBag] = TileBag_1.TileBag.full().take(6);
        return new GameState(hand, tileBag, canvasRect, tgResult, tgResult, new domain_1.Position(0, 0), [], [], immutable_1.Set.of(), immutable_1.Set.of(), immutable_1.Set.of(), 1, 0, immutable_1.List.of(), new CurrentPlacementState(immutable_1.Set.of(), tgResult, 0, immutable_1.Set.of()), undefined, undefined);
    }
}
exports.GameState = GameState;
//# sourceMappingURL=GameState.js.map