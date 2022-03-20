import _ from "lodash";
import { IGameStateUpdater } from "~/game/IGameStateUpdater";
import { GameState } from "~/state/GameState";
import { loadSound } from "./utility";

const fx01 = loadSound("sounds/FX01.mp3");
const rise01 = loadSound("");
const rise02 = loadSound("sounds/Rise02.mp3");
const rise03 = loadSound("sounds/Rise03.mp3");

export class Sounds implements IGameStateUpdater {
  private readonly playlist: Array<HTMLAudioElement> = [];
  private readonly rise1: HTMLAudioElement;
  private readonly rise2: HTMLAudioElement;
  private readonly rise3: HTMLAudioElement;
  private readonly yourgo1: HTMLAudioElement;
  private readonly yourgo2: HTMLAudioElement;
  private readonly yourgo3: HTMLAudioElement;

  private retryPlay(audio: HTMLAudioElement, counter: number): void {
    if (counter === 0) {
      console.log("Stopping retry of autoplay");
    } else {
      audio.play().catch((e) => {
        if (e.name === "NotAllowedError") {
          console.log("WOAH! autoplay disabled");
          setTimeout(() => this.retryPlay(audio, counter - 1), 1000);
        }
      });
    }
  }

  private playNext(): void {
    const next = this.playlist.pop();
    if (next) {
      this.retryPlay(next, 10);
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
    this.yourgo1 = this.loadAndRegister("sounds/yourgo-1.mp3");
    this.yourgo2 = this.loadAndRegister("sounds/yourgo-2.mp3");
    this.yourgo3 = this.loadAndRegister("sounds/yourgo-3.mp3");
  }

  update(gameState: GameState): void {
    if (gameState.scoreJustAchieved > 0) {
      this.rises(gameState.scoreJustAchieved);
      gameState.scoreJustAchieved = 0;
    }

    if (
      gameState.newUserInControl != undefined &&
      gameState.newUserInControl === gameState.currentUser.userId
    ) {
      this.yourgo();
    }
  }

  yourgo(): void {
    const emptyPlaylist = this.playlist.length == 0;
    this.playlist.push(
      _.shuffle([this.yourgo1, this.yourgo2, this.yourgo3])[0]
    );

    if (emptyPlaylist) {
      this.playNext();
    }
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
