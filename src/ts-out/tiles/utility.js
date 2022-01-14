"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.random = exports.loadSound = exports.loadImage = void 0;
function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}
exports.loadImage = loadImage;
function loadSound(src) {
    const audio = new Audio(src);
    return audio;
}
exports.loadSound = loadSound;
function random(min, max) {
    return Math.random() * (max - min) + min;
}
exports.random = random;
//# sourceMappingURL=utility.js.map