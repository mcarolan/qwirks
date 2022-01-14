"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const domain_1 = require("./domain");
class Button {
    position;
    inactive;
    hover;
    tag;
    currentImage;
    rect;
    constructor(position, inactive, hover, tag) {
        this.position = position;
        this.inactive = inactive;
        this.hover = hover;
        this.tag = tag;
        this.currentImage = inactive;
        this.rect = new domain_1.Rect(position, inactive.width, inactive.height);
    }
    updateGameState(gameState) {
        var hovering = false;
        var isClicked = false;
        if (gameState.mousePosition) {
            gameState.mouseEvents.forEach((e) => {
                if (e.type == "MouseClick" && this.rect.contains(e.position)) {
                    isClicked = true;
                    return false;
                }
            });
            hovering = this.rect.contains(gameState.mousePosition);
        }
        const enabled = gameState.enabledButtonTags.contains(this.tag);
        this.currentImage =
            hovering && !isClicked && enabled ? this.hover : this.inactive;
        gameState.setButtonPressed(this.tag, isClicked && enabled);
    }
    draw(context, gameState) {
        const opacity = gameState.enabledButtonTags.contains(this.tag) ? 1.0 : 0.4;
        context.save();
        context.globalAlpha = opacity;
        context.drawImage(this.currentImage, this.position.x, this.position.y);
        context.restore();
    }
}
exports.Button = Button;
//# sourceMappingURL=Button.js.map