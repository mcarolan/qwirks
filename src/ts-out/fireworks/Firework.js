"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Firework = void 0;
const domain_1 = require("~/tiles/domain");
const utility_1 = require("~/tiles/utility");
class Firework {
    start;
    target;
    current;
    distanceToTarget;
    distanceTravelled = 0;
    coordinates;
    angle;
    speed = 2;
    acceleration = 1.04;
    brightness = (0, utility_1.random)(50, 70);
    targetRadius = 1;
    hue = (0, utility_1.random)(0, 360);
    constructor(start, target) {
        this.start = start;
        this.target = target;
        this.current = start;
        this.distanceToTarget = start.distanceTo(target);
        //increase for a longer trail
        this.coordinates = new Array(start, start, start, start);
        this.angle = Math.atan2(target.y - start.y, target.x - start.x);
    }
    update() {
        this.coordinates.pop();
        this.coordinates.unshift(this.current);
        if (this.targetRadius < 8) {
            this.targetRadius += 0.3;
        }
        else {
            this.targetRadius = 1;
        }
        this.speed *= this.acceleration;
        const velocities = new domain_1.Position(Math.cos(this.angle) * this.speed, Math.sin(this.angle) * this.speed);
        const newPosition = this.current.plus(velocities);
        this.distanceTravelled = this.start.distanceTo(newPosition);
        this.current = newPosition;
        return this.distanceTravelled >= this.distanceToTarget;
    }
    draw(context) {
        context.beginPath();
        const last = this.coordinates[this.coordinates.length - 1];
        context.moveTo(last.x, last.y);
        context.lineTo(this.current.x, this.current.y);
        context.strokeStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
        context.stroke();
        context.beginPath();
        context.arc(this.target.x, this.target.y, this.targetRadius, 0, Math.PI * 2);
        context.stroke();
    }
}
exports.Firework = Firework;
//# sourceMappingURL=Firework.js.map