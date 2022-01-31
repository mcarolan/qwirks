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

export function loadSound(src: string): HTMLAudioElement {
  const audio = new Audio(src);
  return audio;
}

export function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
