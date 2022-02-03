import { hash } from "immutable";
import { Position } from "../../../shared/Domain";

export class Rect {
  constructor(
    readonly position: Position,
    readonly width: number,
    readonly height: number
  ) {}

  static from(element: HTMLElement): Rect {
    const r = element.getBoundingClientRect();
    return new Rect(new Position(r.left, r.top), r.width, r.height);
  }

  contains(position: Position): boolean {
    return (
      position.x >= this.position.x &&
      position.x <= this.position.x + this.width &&
      position.y >= this.position.y &&
      position.y <= this.position.y + this.height
    );
  }

  middle(): Position {
    return new Position(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
  }

  toString(): string {
    return `(${this.position.toString()}, width=${this.width}, height=${
      this.height
    })`;
  }

  equals(other: unknown): boolean {
    const o = other as Rect;
    return (
      o &&
      o.position.equals(this.position) &&
      o.width === this.width &&
      o.height === this.height
    );
  }

  hashCode(): number {
    return this.position.hashCode() + hash(this.width) + hash(this.height);
  }
}
