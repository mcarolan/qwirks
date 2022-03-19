import { io, Socket } from "socket.io-client";
import { Main } from ".";
import { User } from "../../shared/User";
import { loadUserFromLocalStorage } from "./browser/BrowserAPI";
import { Fireworks } from "./fireworks/Fireworks";
import { FireworkUpdater } from "./fireworks/FireworkUpdater";
import { Rect, rectFromElement } from "./tiles/domain";
import { GameLogic } from "./tiles/GameLogic";
import { MainComponentStateUpdater } from "./tiles/MainComponentStateUpdater";
import { Mouse } from "./tiles/Mouse";
import { Network } from "./tiles/Network";
import { Score } from "./tiles/Score";
import { Sounds } from "./tiles/Sounds";
import { loadTileGraphics } from "./tiles/TileGraphics";
import { TileGridGraphics } from "./tiles/TileGridGraphics";
import { loadImage } from "./tiles/utility";

export interface GameDependencies {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  mainArea: HTMLElement;
  tileGrid: TileGridGraphics;
  mouse: Mouse;
  score: Score;
  fireworks: Fireworks;
  socket: Socket;
  user: User;
  network: Network;
  sounds: Sounds;
  gameLogic: GameLogic;
  fireworkUpdater: FireworkUpdater;
  mainComponentStateUpdater: MainComponentStateUpdater;
}

export async function loadGameDependencies(
  user: User,
  gameKey: string,
  mainComponent: Main
): Promise<GameDependencies> {
  const canvas = document.querySelector("#game") as HTMLCanvasElement;
  const mainArea = document.querySelector("#mainArea") as HTMLElement;

  const tileGraphics = await loadTileGraphics();

  const score = new Score();

  const socket = io("http://localhost:3000");

  const mouse = new Mouse();

  const firstTileImage = await loadImage("./images/first-tile.png");

  const tileGrid = new TileGridGraphics(tileGraphics, firstTileImage);

  const fireworks = new Fireworks();

  const sounds = new Sounds();

  const fireworkUpdater = new FireworkUpdater(
    tileGraphics,
    tileGrid,
    fireworks
  );

  return {
    canvas,
    context: canvas.getContext("2d") as CanvasRenderingContext2D,
    mainArea,
    tileGrid,
    mouse,
    score,
    fireworks,
    socket,
    user,
    network: new Network(socket, user, gameKey),
    sounds,
    gameLogic: new GameLogic(),
    fireworkUpdater,
    mainComponentStateUpdater: new MainComponentStateUpdater(mainComponent),
  };
}
