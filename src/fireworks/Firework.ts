import { Position } from "../tiles/domain";
import { random } from "../tiles/utility";

export class Firework {
  private current: Position;
  private readonly distanceToTarget: number;
  private distanceTravelled: number = 0;
  private coordinates: Array<Position>;
  private angle: number;
  private speed: number = 2;
  private readonly acceleration: number = 1.04;
  private readonly brightness: number = random(50, 70);
  private targetRadius: number = 1;
  private readonly hue: number = random(0, 360);

  constructor(private readonly start: Position, readonly target: Position) {
    this.current = start;
    this.distanceToTarget = start.distanceTo(target);
    //increase for a longer trail
    this.coordinates = new Array<Position>(start, start, start, start);
    this.angle = Math.atan2(target.y - start.y, target.x - start.x);
  }

  update(): boolean {
    this.coordinates.pop();
    this.coordinates.unshift(this.current);

    if (this.targetRadius < 8) {
      this.targetRadius += 0.3;
    } else {
      this.targetRadius = 1;
    }

    this.speed *= this.acceleration;

    const velocities = new Position(
      Math.cos(this.angle) * this.speed,
      Math.sin(this.angle) * this.speed
    );

    const newPosition = this.current.plus(velocities);

    this.distanceTravelled = this.start.distanceTo(newPosition);
    this.current = newPosition;

    return this.distanceTravelled >= this.distanceToTarget;
  }

  draw(context: CanvasRenderingContext2D): void {
    context.beginPath();
    const last = this.coordinates[this.coordinates.length - 1];
    context.moveTo(last.x, last.y);
    context.lineTo(this.current.x, this.current.y);
    context.strokeStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
    context.stroke();

    context.beginPath();
    context.arc(
      this.target.x,
      this.target.y,
      this.targetRadius,
      0,
      Math.PI * 2
    );
    context.stroke();
  }
}
