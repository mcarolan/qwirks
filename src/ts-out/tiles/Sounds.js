"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sounds = void 0;
const lodash_1 = __importDefault(require("lodash"));
const utility_1 = require("./utility");
const fx01 = (0, utility_1.loadSound)("sounds/FX01.mp3");
const rise01 = (0, utility_1.loadSound)("");
const rise02 = (0, utility_1.loadSound)("sounds/Rise02.mp3");
const rise03 = (0, utility_1.loadSound)("sounds/Rise03.mp3");
class Sounds {
    playlist = [];
    rise1;
    rise2;
    rise3;
    playNext() {
        const next = this.playlist.pop();
        if (next) {
            next.play();
        }
    }
    loadAndRegister(path) {
        const audio = (0, utility_1.loadSound)(path);
        audio.addEventListener("ended", () => this.playNext());
        return audio;
    }
    constructor() {
        this.rise1 = this.loadAndRegister("sounds/rise1.mp3");
        this.rise2 = this.loadAndRegister("sounds/rise2.mp3");
        this.rise3 = this.loadAndRegister("sounds/rise3.mp3");
    }
    rises(n) {
        const emptyPlaylist = this.playlist.length == 0;
        const sounds = [this.rise1, this.rise2, this.rise3];
        var toChooseFrom = lodash_1.default.shuffle(Array.from(sounds));
        while (n--) {
            if (toChooseFrom.length == 0) {
                toChooseFrom = lodash_1.default.shuffle(Array.from(sounds));
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
exports.Sounds = Sounds;
//# sourceMappingURL=Sounds.js.map