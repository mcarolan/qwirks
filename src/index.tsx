import { Rect, Tile } from "./tiles/domain";

import _ from "lodash";
import { Position } from "./tiles/domain";
import { Map } from "immutable";
import { PanelGraphics } from "./tiles/PanelGraphics";
import { TileGridGraphics } from "./tiles/TileGridGraphics";
import { GameState } from "./tiles/GameState";
import { Mouse } from "./tiles/Mouse";
import { GameLogic } from "./tiles/GameLogic";
import { loadImage, random } from "./tiles/utility";
import { Button } from "./tiles/Button";
import { Score } from "./tiles/Score";
import { Sounds } from "./tiles/Sounds";
import { Fireworks } from "./fireworks/Fireworks";
import { is, List } from "immutable";
import { loadTileGraphics, TileGraphics } from "./tiles/TileGraphics";
import { io, Socket } from "socket.io-client";
import { Network } from "./tiles/Network";
import ReactDOM from "react-dom";
import React from "react";
import { UsernamePanel } from "./UsernamePanel";
import { IGameStateUpdater } from "./IGameStateUpdater";
import { UserList } from "./UserList";
import { loadUser, User, UserWithStatus } from "./tiles/User";
import { ConnectionStatus } from "./ConnectionStatus";
import { StartButton } from "./StartButton";

export enum ButtonTags {
  Accept = "accept",
  Swap = "swap",
  Cancel = "cancel",
}

interface GameDependencies {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  mainArea: HTMLElement;
  bottomPanel: HTMLElement;
  panel: PanelGraphics;
  tileGrid: TileGridGraphics;
  mouse: Mouse;
  acceptButton: Button;
  swapButton: Button;
  cancelButton: Button;
  score: Score;
  fireworks: Fireworks;
  socket: Socket;
  user: User;
  network: Network;
  sounds: Sounds;
  gameLogic: GameLogic;
  fireworkUpdater: FireworkUpdater;
}

class FireworkUpdater implements IGameStateUpdater {
  constructor(
    private tileGraphics: TileGraphics,
    private tileGrid: TileGridGraphics,
    private acceptButton: Button,
    private fireworks: Fireworks,
    private mainAreaRect: Rect,
    private sounds: Sounds
  ) {}

  update(gameState: GameState): GameState {
    const targets = gameState.fireworkTilePositions.map((tp) =>
      this.tileGrid
        .tilePositionToScreenCoords(tp, gameState)
        .plus(
          new Position(
            this.tileGraphics.tileWidth / 2,
            this.tileGraphics.tileHeight / 2
          )
        )
    );

    const acceptButtonMid = this.acceptButton.rect.middle();

    targets.forEach((p) => {
      this.fireworks.create(acceptButtonMid, p);

      var i = gameState.scoreJustAchieved ?? 0;

      while (i--) {
        this.fireworks.create(
          this.fireworks.randomOrigin(this.mainAreaRect),
          p
        );
      }
    });

    if (gameState.scoreJustAchieved > 0) {
      this.sounds.rises(gameState.scoreJustAchieved);
    }

    return {
      ...gameState,
      fireworkTilePositions: List(),
      scoreJustAchieved: 0,
    };
  }
}

function updateGameState(
  initial: GameState,
  ...updaters: IGameStateUpdater[]
): GameState {
  var state: GameState = { ...initial };

  for (const updater of updaters) {
    state = updater.update(state);
  }

  return state;
}

interface SidebarState {
  userList: Map<string, UserWithStatus>;
  currentUser: User | undefined;
  isConnected: boolean;
}

class Main extends React.Component<{}, SidebarState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      userList: Map(),
      currentUser: undefined,
      isConnected: false,
    };
  }

  private shouldUpdateState(gameState: GameState): boolean {
    return (
      !is(this.state.currentUser, gameState.currentUser) ||
      !is(this.state.userList, gameState.userList) ||
      !is(this.state.isConnected, gameState.isConnected)
    );
  }

  update(gameState: GameState, callback: () => void): void {
    if (this.shouldUpdateState(gameState)) {
      this.setState(
        {
          userList: gameState.userList,
          currentUser: gameState.currentUser,
          isConnected: gameState.isConnected,
        },
        () => {
          console.log(`react state update ${JSON.stringify(this.state)}`);
          callback();
        }
      );
    } else {
      callback();
    }
  }

  private frameId: number | undefined;

  frame(gameState: GameState, deps: GameDependencies): void {
    deps.context.clearRect(
      0,
      0,
      deps.context.canvas.width,
      deps.context.canvas.height
    );
    const nextState = updateGameState(
      {
        ...gameState,
        mainAreaBounds: Rect.from(deps.mainArea),
        bottomPanelBounds: Rect.from(deps.bottomPanel),
      },
      deps.network,
      deps.mouse,
      deps.panel,
      deps.tileGrid,
      deps.acceptButton,
      deps.swapButton,
      deps.cancelButton,
      deps.gameLogic,
      deps.fireworkUpdater
    );
    deps.tileGrid.draw(deps.context, nextState);
    deps.panel.draw(deps.context, nextState);
    deps.acceptButton.draw(deps.context, nextState);
    deps.swapButton.draw(deps.context, nextState);
    deps.cancelButton.draw(deps.context, nextState);
    deps.score.draw(deps.context, nextState);
    deps.fireworks.updateAndDraw(deps.context);

    this.update(nextState, () => {
      this.frameId = requestAnimationFrame((_) => this.frame(nextState, deps));
    });
  }

  async componentDidMount() {
    const canvas = document.querySelector("#game") as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const mainArea = document.querySelector("#mainArea") as HTMLElement;
    const bottomPanel = document.querySelector("#bottomPanel") as HTMLElement;

    const acceptInactive = await loadImage("./images/accept-inactive.png");
    const acceptHover = await loadImage("./images/accept-hover.png");

    const swapInactive = await loadImage("./images/swap-inactive.png");
    const swapHover = await loadImage("./images/swap-hover.png");

    const cancelInactive = await loadImage("./images/cancel-inactive.png");
    const cancelHover = await loadImage("./images/cancel-hover.png");

    const tileGraphics = await loadTileGraphics();

    const acceptButton = new Button(
      new Position(-acceptInactive.width - 10, 10),
      acceptInactive,
      acceptHover,
      ButtonTags.Accept
    );

    const swapButton = new Button(
      new Position(-acceptInactive.width - 10, acceptInactive.height + 10 + 10),
      swapInactive,
      swapHover,
      ButtonTags.Swap
    );

    const cancelButton = new Button(
      new Position(
        -acceptInactive.width - 10,
        acceptInactive.height + 10 + swapInactive.height + 10 + 10
      ),
      cancelInactive,
      cancelHover,
      ButtonTags.Cancel
    );

    const score = new Score(new Position(10, 10));

    const socket = io("http://localhost:3000");

    const user = loadUser();

    const mouse = new Mouse();

    const tileGrid = new TileGridGraphics(tileGraphics);

    const fireworks = new Fireworks();

    const sounds = new Sounds();

    const fireworkUpdater = new FireworkUpdater(
      tileGraphics,
      tileGrid,
      acceptButton,
      fireworks,
      Rect.from(mainArea),
      sounds
    );

    const dependencies: GameDependencies = {
      canvas,
      context,
      mainArea,
      bottomPanel,
      panel: new PanelGraphics(tileGraphics),
      tileGrid,
      mouse,
      acceptButton,
      swapButton,
      cancelButton,
      score,
      fireworks,
      socket,
      user,
      network: new Network(socket, user),
      sounds,
      gameLogic: new GameLogic(),
      fireworkUpdater,
    };
    console.log(dependencies);
    document.addEventListener("mousedown", Mouse.updateMouseDown(mouse));
    document.addEventListener("mouseup", Mouse.updateMouseUp(mouse));
    document.addEventListener("mousemove", Mouse.updateMousePosition(mouse));

    this.frameId = requestAnimationFrame((_) =>
      this.frame(
        GameState.initial(user, Rect.from(mainArea), Rect.from(bottomPanel)),
        dependencies
      )
    );
  }

  componentWillUnmount() {
    if (this.frameId != undefined) {
      cancelAnimationFrame(this.frameId);
    }
  }

  render() {
    return (
      <div>
        <UsernamePanel currentUser={this.state.currentUser} />
        <UserList userList={this.state.userList} />
        <ConnectionStatus isConnected={this.state.isConnected} />
        {/* <StartButton /> */}
      </div>
    );
  }
}

const sidebarRight = document.querySelector("#sidebarRight");
ReactDOM.render(<Main />, sidebarRight);
