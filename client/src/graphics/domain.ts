import { Position } from "../../../shared/Domain";

export interface Rect {
  position: Position;
  width: number;
  height: number;
}

export function rectFromElement(element: HTMLElement): Rect {
  const r = element.getBoundingClientRect();

  return {
    position: {
      x: r.left,
      y: r.top,
    },
    width: r.width,
    height: r.height,
  };
}

export function rectContains(rect: Rect, position: Position): boolean {
  return (
    position.x >= rect.position.x &&
    position.x <= rect.position.x + rect.width &&
    position.y >= rect.position.y &&
    position.y <= rect.position.y + rect.height
  );
}

export function middle(rect: Rect): Position {
  return {
    x: rect.position.x + rect.width / 2,
    y: rect.position.y + rect.height / 2,
  };
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = src;

  const p = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(`could not load ${src}`);
    img.src = src;
  });

  return p;
}