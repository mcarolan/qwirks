import { List } from "immutable";
import { Position, Rect } from "~/tiles/domain";
import { random } from "~/tiles/utility";
import { Firework } from "./Firework";
import { Particle } from "./Particle";

export class Fireworks {
  private fireworks: List<Firework> = List();
  private particles: List<Particle> = List();

  create(start: Position, target: Position): void {
    this.fireworks = this.fireworks.concat(new Firework(start, target));
  }

  randomOrigin(rect: Rect): Position {
    if (random(0, 1)) {
      if (random(0, 1)) {
        return new Position(-20, random(-20, rect.height + 20));
      } else {
        return new Position(20, random(-20, rect.height + 20));
      }
    } else {
      if (random(0, 1)) {
        return new Position(random(-20, rect.width + 20), -20);
      } else {
        return new Position(random(20, rect.width + 20), 20);
      }
    }
  }

  updateAndDraw(context: CanvasRenderingContext2D): void {
    this.fireworks.forEach((f, i) => {
      f.draw(context);

      if (f.update()) {
        this.fireworks = this.fireworks.remove(i);
        this.particles = this.particles.withMutations((m) => {
          var i: number = 60;
          while (i--) {
            m.concat(new Particle(f.target));
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