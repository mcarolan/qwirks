import _ from "lodash";
import { loadSound } from "./utility";

const fx01 = loadSound("sounds/FX01.mp3");
const rise01 = loadSound("");
const rise02 = loadSound("sounds/Rise02.mp3");
const rise03 = loadSound("sounds/Rise03.mp3");

export class Sounds {
  private readonly playlist: Array<HTMLAudioElement> = [];
  private readonly rise1: HTMLAudioElement;
  private readonly rise2: HTMLAudioElement;
  private readonly rise3: HTMLAudioElement;

  private playNext(): void {
    const next = this.playlist.pop();
    if (next) {
      next.play();
    }
  }

  private loadAndRegister(path: string): HTMLAudioElement {
    const audio = loadSound(path);
    audio.addEventListener("ended", () => this.playNext());
    return audio;
  }

  constructor() {
    this.rise1 = this.loadAndRegister("sounds/rise1.mp3");
    this.rise2 = this.loadAndRegister("sounds/rise2.mp3");
    this.rise3 = this.loadAndRegister("sounds/rise3.mp3");
  }

  rises(n: number): void {
    const emptyPlaylist = this.playlist.length == 0;
    const sounds = [this.rise1, this.rise2, this.rise3];
    var toChooseFrom = _.shuffle(Array.from(sounds));

    while (n--) {
      if (toChooseFrom.length == 0) {
        toChooseFrom = _.shuffle(Array.from(sounds));
      }
      const sound = toChooseFrom.pop();
      if (sound) {
        this.playlist.push(sound);
      }
    }

    if (emptyPlaylist) {
      this.playNext();
    }
  }
}
