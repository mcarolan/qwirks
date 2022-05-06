import { io, Socket } from "socket.io-client";
import { User } from "../../../shared/User";
import { Fireworks } from "../fireworks/Fireworks";
import { FireworkUpdater } from "../fireworks/FireworkUpdater";
import { GameLogic } from "./GameLogic";
import { Mouse } from "./Mouse";
import { Network } from "./Network";
import { Sounds } from "./Sounds";
import { loadTileGraphics } from "../graphics/TileGraphics";
import { TileGridGraphics } from "../graphics/TileGridGraphics";
import { loadImage } from "../graphics/domain";

export interface GameDependencies {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  mainArea: HTMLElement;
  tileGrid: TileGridGraphics;
  mouse: Mouse;
  fireworks: Fireworks;
  socket: Socket;
  user: User;
  network: Network;
  sounds: Sounds;
  gameLogic: GameLogic;
  fireworkUpdater: FireworkUpdater;
}

export async function loadGameDependencies(
  user: User,
  gameKey: string
): Promise<GameDependencies> {
  const canvas = document.querySelector("#game") as HTMLCanvasElement;
  const mainArea = document.querySelector("#mainArea") as HTMLElement;

  const tileGraphics = await loadTileGraphics();

  const socket = io("http://192.168.0.21:3000");

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
    fireworks,
    socket,
    user,
    network: new Network(socket, user, gameKey),
    sounds,
    gameLogic: new GameLogic(),
    fireworkUpdater,
  };
}
