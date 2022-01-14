"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Particle = void 0;
const domain_1 = require("~/tiles/domain");
const utility_1 = require("~/tiles/utility");
class Particle {
    coordinates;
    angle = (0, utility_1.random)(0, Math.PI * 2);
    speed = (0, utility_1.random)(1, 10);
    friction = 0.95;
    gravity = 1;
    hue = (0, utility_1.random)(0, 360);
    brightness = (0, utility_1.random)(50, 80);
    alpha = 1;
    decay = (0, utility_1.random)(0.006, 0.012) / 2.5;
    current;
    constructor(position) {
        this.current = position;
        this.coordinates = new Array(position, position, position, position, position);
    }
    update() {
        this.coordinates.pop();
        this.coordinates.unshift(this.current);
        this.speed *= this.friction;
        this.current = this.current.plus(new domain_1.Position(Math.cos(this.angle) * this.speed, Math.sin(this.angle) * this.speed + this.gravity));
        this.alpha -= this.decay;
        return this.alpha <= this.decay;
    }
    draw(context) {
        context.beginPath();
        const last = this.coordinates[this.coordinates.length - 1];
        context.moveTo(last.x, last.y);
        context.lineTo(this.current.x, this.current.y);
        context.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
        context.stroke();
    }
}
exports.Particle = Particle;
//# sourceMappingURL=Particle.js.map