import { Position, plus } from "../../../shared/Domain";
import { random } from "../tiles/utility";

export class Particle {
  private readonly coordinates: Array<Position>;
  private readonly angle: number = random(0, Math.PI * 2);
  private speed: number = random(1, 10);
  private readonly friction: number = 0.95;
  private readonly gravity: number = 1;
  private readonly hue: number = random(0, 360);
  private readonly brightness: number = random(50, 80);
  private alpha: number = 1;
  private readonly decay: number = random(0.006, 0.012) / 2.5;
  private current: Position;

  constructor(position: Position) {
    this.current = position;
    this.coordinates = new Array<Position>(
      position,
      position,
      position,
      position,
      position
    );
  }

  update(): boolean {
    this.coordinates.pop();
    this.coordinates.unshift(this.current);
    this.speed *= this.friction;
    this.current = plus(this.current, {
      x: Math.cos(this.angle) * this.speed,
      y: Math.sin(this.angle) * this.speed + this.gravity,
    });
    this.alpha -= this.decay;
    return this.alpha <= this.decay;
  }

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    const last = this.coordinates[this.coordinates.length - 1];
    context.moveTo(last.x, last.y);
    context.lineTo(this.current.x, this.current.y);
    context.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
    context.stroke();
  }
}
