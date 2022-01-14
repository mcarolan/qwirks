"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelButton = exports.swapButton = exports.acceptButton = void 0;
const domain_1 = require("./tiles/domain");
const domain_2 = require("./tiles/domain");
const PanelGraphics_1 = require("./tiles/PanelGraphics");
const TileGridGraphics_1 = require("./tiles/TileGridGraphics");
const GameState_1 = require("./tiles/GameState");
const Mouse_1 = require("./tiles/Mouse");
const GameLogic_1 = require("./tiles/GameLogic");
const utility_1 = require("./tiles/utility");
const Button_1 = require("./tiles/Button");
const Score_1 = require("./tiles/Score");
const Sounds_1 = require("./tiles/Sounds");
const Fireworks_1 = require("./fireworks/Fireworks");
const immutable_1 = require("immutable");
const TileGraphics_1 = require("./tiles/TileGraphics");
const socket_io_client_1 = require("socket.io-client");
const Network_1 = require("./tiles/Network");
const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const canvasRect = new domain_1.Rect(new domain_2.Position(0, 0), canvas.width, canvas.height);
const gameState = GameState_1.GameState.initial(canvasRect);
const tileGridRect = new domain_1.Rect(new domain_2.Position(10, 10), canvasRect.width, canvasRect.height - PanelGraphics_1.PANEL_HEIGHT - 10);
var panel;
const tileGrid = new TileGridGraphics_1.TileGridGraphics(tileGridRect);
const mouse = new Mouse_1.Mouse();
document.addEventListener("mousedown", Mouse_1.Mouse.updateMouseDown(mouse));
document.addEventListener("mouseup", Mouse_1.Mouse.updateMouseUp(mouse));
document.addEventListener("mousemove", Mouse_1.Mouse.updateMousePosition(mouse));
const acceptInactive = (0, utility_1.loadImage)("./images/accept-inactive.png");
const acceptHover = (0, utility_1.loadImage)("./images/accept-hover.png");
const swapInactive = (0, utility_1.loadImage)("./images/swap-inactive.png");
const swapHover = (0, utility_1.loadImage)("./images/swap-hover.png");
const cancelInactive = (0, utility_1.loadImage)("./images/cancel-inactive.png");
const cancelHover = (0, utility_1.loadImage)("./images/cancel-hover.png");
exports.acceptButton = new Button_1.Button(new domain_2.Position(canvasRect.width - acceptInactive.width - 10, 10), acceptInactive, acceptHover, "accept");
exports.swapButton = new Button_1.Button(exports.acceptButton.position.plus(new domain_2.Position(0, acceptInactive.height + 10)), swapInactive, swapHover, "swap");
exports.cancelButton = new Button_1.Button(exports.swapButton.position.plus(new domain_2.Position(0, swapInactive.height + 10)), cancelInactive, cancelHover, "cancel");
const score = new Score_1.Score(new domain_2.Position(10, 10));
const fireworks = new Fireworks_1.Fireworks();
const socket = (0, socket_io_client_1.io)();
const network = new Network_1.Network(socket);
const sounds = new Sounds_1.Sounds();
function updateFireworks(gameState) {
    const targets = gameState.fireworkTilePositions.map((tp) => tileGrid
        .tilePositionToScreenCoords(tp)
        .plus(new domain_2.Position(TileGraphics_1.TileGraphics.tileWidth / 2, TileGraphics_1.TileGraphics.tileHeight / 2)));
    const acceptButtonMid = exports.acceptButton.position.plus(new domain_2.Position(acceptInactive.width / 2, acceptInactive.height / 2));
    targets.forEach((p) => {
        fireworks.create(acceptButtonMid, p);
        var i = 5;
        while (i--) {
            fireworks.create(fireworks.randomOrigin(canvasRect), p);
        }
    });
    if (gameState.scoreJustAchieved > 0) {
        sounds.rises(gameState.scoreJustAchieved);
        gameState.scoreJustAchieved = 0;
    }
    gameState.fireworkTilePositions = (0, immutable_1.List)();
}
function gameLoop(context) {
    context.fillStyle = "red";
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    if (!panel) {
        panel = new PanelGraphics_1.PanelGraphics(gameState);
    }
    mouse.updateGameState(gameState);
    network.updateState(gameState);
    panel.updateGameState(gameState);
    tileGrid.updateGameState(gameState);
    exports.acceptButton.updateGameState(gameState);
    exports.swapButton.updateGameState(gameState);
    exports.cancelButton.updateGameState(gameState);
    GameLogic_1.GameLogic.updateGameState(gameState);
    updateFireworks(gameState);
    tileGrid.draw(context, gameState);
    panel.draw(context, gameState);
    exports.acceptButton.draw(context, gameState);
    exports.swapButton.draw(context, gameState);
    exports.cancelButton.draw(context, gameState);
    score.draw(context, gameState);
    fireworks.updateAndDraw(context);
    requestAnimationFrame(() => gameLoop(context));
}
gameLoop(context);
//# sourceMappingURL=index.js.map