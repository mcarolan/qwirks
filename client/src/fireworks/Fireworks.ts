import { Rect } from "../tiles/domain";
import { random } from "../tiles/utility";
import { Firework } from "./Firework";
import { Particle } from "./Particle";
import { Position } from "../../../shared/Domain";

export class Fireworks {
  private fireworks: Array<Firework> = new Array();
  private particles: Array<Particle> = new Array();

  create(start: Position, target: Position): void {
    this.fireworks.push(new Firework(start, target));
  }

  get size(): number {
    return this.fireworks.length;
  }

  randomOrigin(rect: Rect): Position {
    if (Math.round(random(0, 1))) {
      if (Math.round(random(0, 1))) {
        return { x: -20, y: Math.round(random(-20, rect.height + 20)) };
      } else {
        return {
          x: rect.width + 20,
          y: Math.round(random(-20, rect.height + 20)),
        };
      }
    } else {
      if (Math.round(random(0, 1))) {
        return { x: Math.round(random(-20, rect.width + 20)), y: -20 };
      } else {
        return {
          x: Math.round(random(20, rect.width + 20)),
          y: rect.height + 20,
        };
      }
    }
  }

  updateAndDraw(context: CanvasRenderingContext2D): void {
    this.fireworks.forEach((f, i) => {
      f.draw(context);

      if (f.update()) {
        this.fireworks.splice(i, 1);
        var i: number = 50;
        while (i--) {
          this.particles.push(new Particle(f.target));
        }
      }
    });

    this.particles.forEach((p, i) => {
      p.draw(context);

      if (p.update()) {
        this.particles.splice(i, 1);
      }
    });
  }
}
