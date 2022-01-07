import { loadSound } from "./utility";

const fx01 = loadSound("sounds/FX01.mp3");

export class Sounds {
  static ding(): void {
    console.log("ding");
    fx01.playbackRate = 1.2;
    fx01.play();
  }
}
