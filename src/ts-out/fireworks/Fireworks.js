"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fireworks = void 0;
const immutable_1 = require("immutable");
const domain_1 = require("~/tiles/domain");
const utility_1 = require("~/tiles/utility");
const Firework_1 = require("./Firework");
const Particle_1 = require("./Particle");
class Fireworks {
    fireworks = (0, immutable_1.List)();
    particles = (0, immutable_1.List)();
    create(start, target) {
        this.fireworks = this.fireworks.concat(new Firework_1.Firework(start, target));
    }
    randomOrigin(rect) {
        if (Math.round((0, utility_1.random)(0, 1))) {
            if (Math.round((0, utility_1.random)(0, 1))) {
                return new domain_1.Position(-20, Math.round((0, utility_1.random)(-20, rect.height + 20)));
            }
            else {
                return new domain_1.Position(rect.width + 20, Math.round((0, utility_1.random)(-20, rect.height + 20)));
            }
        }
        else {
            if (Math.round((0, utility_1.random)(0, 1))) {
                return new domain_1.Position(Math.round((0, utility_1.random)(-20, rect.width + 20)), -20);
            }
            else {
                return new domain_1.Position(Math.round((0, utility_1.random)(20, rect.width + 20)), rect.height + 20);
            }
        }
    }
    updateAndDraw(context) {
        this.fireworks.forEach((f, i) => {
            f.draw(context);
            if (f.update()) {
                this.fireworks = this.fireworks.remove(i);
                this.particles = this.particles.withMutations((m) => {
                    var i = 60;
                    while (i--) {
                        m.concat(new Particle_1.Particle(f.target));
                    }
                });
            }
        });
        this.particles.forEach((p, i) => {
            p.draw(context);
            if (p.update()) {
                this.particles = this.particles.remove(i);
            }
        });
    }
}
exports.Fireworks = Fireworks;
//# sourceMappingURL=Fireworks.js.map