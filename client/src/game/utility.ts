export function loadSound(src: string): HTMLAudioElement {
  const audio = new Audio(src);
  return audio;
}

export function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
