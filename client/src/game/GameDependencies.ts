import { io, Socket } from "socket.io-client";
import { User } from "../../../shared/User";
import { Fireworks } from "../fireworks/Fireworks";
import { FireworkUpdater } from "../fireworks/FireworkUpdater";
import { GameLogic } from "./GameLogic";
import { Network } from "./Network";
import { Sounds } from "./Sounds";
import { loadTileGraphics } from "../graphics/TileGraphics";
import { TileGridGraphics } from "../graphics/TileGridGraphics";
import { loadImage, middle, rectFromElement } from "../graphics/domain";
import { MouseUpdater, registerMouseUpdater } from "./Mouse";
import { mul } from "../../../shared/Domain";

export interface GameDependencies {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  mainArea: HTMLElement;
  tileGrid: TileGridGraphics;
  mouseUpdater: MouseUpdater;
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
  gameKey: string,
  document: Document
): Promise<GameDependencies> {
  const canvas = document.querySelector("#game") as HTMLCanvasElement;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  const mainArea = document.querySelector("#mainArea") as HTMLElement;

  const tileGraphics = await loadTileGraphics(context);

  const socket = io("http://192.168.0.16:3000");

  const mouseUpdater = registerMouseUpdater(document, mul(middle(rectFromElement(mainArea)), -1));

  const firstTileImage = await loadImage("./images/first-tile.png");

  const tileGrid = new TileGridGraphics(tileGraphics, firstTileImage);

  const fireworks = new Fireworks();

  const sounds = new Sounds();

  const fireworkUpdater = new FireworkUpdater(
    tileGraphics,
    fireworks
  );

  return {
    canvas,
    context,
    mainArea,
    tileGrid,
    mouseUpdater,
    fireworks,
    socket,
    user,
    network: new Network(socket, user, gameKey),
    sounds,
    gameLogic: new GameLogic(),
    fireworkUpdater,
  };
}
