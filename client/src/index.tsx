import { Rect, rectFromElement } from "./tiles/domain";

import { plus } from "../../shared/Domain";
import { Map, Set as ImmSet } from "immutable";
import { PanelGraphics } from "./tiles/PanelGraphics";
import { TileGridGraphics } from "./tiles/TileGridGraphics";
import { GameState, initialGameState } from "./tiles/GameState";
import { Mouse } from "./tiles/Mouse";
import { GameLogic } from "./tiles/GameLogic";
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
import {
  generateNewURLWithGameKey,
  getGameKeyFromURL,
  loadUserFromLocalStorage,
} from "./browser/BrowserAPI";
import { ConnectionStatus } from "./ConnectionStatus";
import { Button } from "./Button";
import { User, UserWithStatus } from "../../shared/User";
import { loadImage } from "./tiles/utility";

export enum ButtonTag {
  Start = "start",
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
    private fireworks: Fireworks,
    private mainAreaRect: Rect,
    private sounds: Sounds
  ) {}

  update(gameState: GameState): void {
    if (!gameState.fireworkTilePositions.isEmpty()) {
      console.log("fire in the hole");
      const tileOffset = {
        x: this.tileGraphics.tileWidth / 2,
        y: this.tileGraphics.tileHeight / 2,
      };
      const fireFrom = {
        x: gameState.mousePosition.x,
        y: gameState.mousePosition.y,
      };

      gameState.fireworkTilePositions.forEach((tp) => {
        const p = plus(
          this.tileGrid.tilePositionToScreenCoords(tp, gameState),
          tileOffset
        );
        this.fireworks.create(fireFrom, p);

        var i = gameState.scoreJustAchieved ?? 0;

        while (i--) {
          this.fireworks.create(
            this.fireworks.randomOrigin(this.mainAreaRect),
            p
          );
        }
      });
      gameState.fireworkTilePositions = List();
    }

    if (gameState.scoreJustAchieved > 0) {
      this.sounds.rises(gameState.scoreJustAchieved);
      gameState.scoreJustAchieved = 0;
    }
  }
}

interface MainState {
  userList: Map<string, UserWithStatus>;
  currentUser: User | undefined;
  isConnected: boolean;
  isStarted: boolean;
  enabledButtonTags: ImmSet<ButtonTag>;
  visibleButtonTags: ImmSet<ButtonTag>;
  userInControl: string | undefined;
}

interface MainProps {
  gameKey: string;
}

class Main
  extends React.Component<MainProps, MainState>
  implements IGameStateUpdater {
  constructor(props: MainProps) {
    super(props);
    this.state = {
      userList: Map(),
      isConnected: false,
      isStarted: false,
      enabledButtonTags: ImmSet(),
      visibleButtonTags: ImmSet(),
      currentUser: undefined,
      userInControl: undefined,
    };
  }

  private buttonsClicked: Array<ButtonTag> = [];

  onClickButton(buttonTag: ButtonTag): () => void {
    return () => this.buttonsClicked.push(buttonTag);
  }

  private shouldUpdateState(gameState: GameState): boolean {
    return (
      !is(this.state.currentUser, gameState.currentUser) ||
      !is(this.state.userList, gameState.userList) ||
      !is(this.state.isConnected, gameState.isConnected) ||
      !is(this.state.isStarted, gameState.isStarted) ||
      !is(this.state.enabledButtonTags, gameState.enabledButtonTags) ||
      !is(this.state.visibleButtonTags, gameState.visibleButtonTags) ||
      !is(this.state.userInControl, gameState.userInControl)
    );
  }

  update(gameState: GameState): void {
    if (this.buttonsClicked.length > 0) {
      gameState.pressedButtonTags = ImmSet(this.buttonsClicked);
      this.buttonsClicked = [];
    } else {
      gameState.pressedButtonTags = ImmSet();
    }
  }

  updateReactState(gameState: GameState, deps: GameDependencies): void {
    if (this.shouldUpdateState(gameState)) {
      this.setState(
        {
          userList: gameState.userList,
          currentUser: gameState.currentUser,
          isConnected: gameState.isConnected,
          isStarted: gameState.isStarted,
          enabledButtonTags: gameState.enabledButtonTags,
          visibleButtonTags: gameState.visibleButtonTags,
          userInControl: gameState.userInControl,
        },
        () => {
          console.log(`react state update ${JSON.stringify(this.state)}`);
          this.frameId = requestAnimationFrame((_) =>
            this.frame(gameState, deps)
          );
        }
      );
    } else {
      this.frameId = requestAnimationFrame((_) => this.frame(gameState, deps));
    }
  }

  private frameId: number | undefined;

  private counter: number = 0;

  frame(gameState: GameState, deps: GameDependencies): void {
    deps.context.clearRect(
      0,
      0,
      deps.context.canvas.width,
      deps.context.canvas.height
    );
    gameState.mainAreaBounds = rectFromElement(deps.mainArea);
    gameState.bottomPanelBounds = rectFromElement(deps.bottomPanel);

    this.update(gameState);
    deps.network.update(gameState);
    deps.mouse.update(gameState);
    deps.panel.update(gameState);
    deps.tileGrid.update(gameState);
    deps.gameLogic.update(gameState);
    deps.fireworkUpdater.update(gameState);

    deps.tileGrid.draw(deps.context, gameState);
    deps.panel.draw(deps.context, gameState);
    deps.score.draw(deps.context, gameState);
    deps.fireworks.updateAndDraw(deps.context);
    this.counter++;
    this.counter = this.counter % 100;

    if (this.counter === 0) {
      this.frameId = requestAnimationFrame((_) =>
        this.updateReactState(gameState, deps)
      );
    } else {
      this.frameId = requestAnimationFrame((_) => this.frame(gameState, deps));
    }
  }

  async componentDidMount() {
    const canvas = document.querySelector("#game") as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const mainArea = document.querySelector("#mainArea") as HTMLElement;
    const bottomPanel = document.querySelector("#bottomPanel") as HTMLElement;

    const tileGraphics = await loadTileGraphics();

    const score = new Score();

    const socket = io("http://localhost:3000");

    const user = loadUserFromLocalStorage();

    const mouse = new Mouse();

    const firstTileImage = await loadImage("./images/first-tile.png");

    const tileGrid = new TileGridGraphics(tileGraphics, firstTileImage);

    const fireworks = new Fireworks();

    const sounds = new Sounds();

    const fireworkUpdater = new FireworkUpdater(
      tileGraphics,
      tileGrid,
      fireworks,
      rectFromElement(mainArea),
      sounds
    );

    const dependencies: GameDependencies = {
      canvas,
      context: canvas.getContext("2d") as CanvasRenderingContext2D,
      mainArea,
      bottomPanel,
      panel: new PanelGraphics(tileGraphics),
      tileGrid,
      mouse,
      score,
      fireworks,
      socket,
      user,
      network: new Network(socket, user, this.props.gameKey),
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
        initialGameState(
          this.props.gameKey,
          user,
          rectFromElement(mainArea),
          rectFromElement(bottomPanel)
        ),
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
    const isEnabled = (tag: ButtonTag) =>
      this.state.enabledButtonTags.contains(tag);

    const isVisible = (tag: ButtonTag) =>
      this.state.visibleButtonTags.contains(tag);

    return (
      <div id="wrapper">
        <div id="mainArea">
          <div id="buttonsContainer">
            <div className="main-buttons">
              <Button
                visible={isVisible(ButtonTag.Start)}
                onClick={this.onClickButton(ButtonTag.Start)}
                text="Start"
                enabled={isEnabled(ButtonTag.Start)}
              />
            </div>
            <div className="right-side-buttons">
              <div>
                <Button
                  visible={isVisible(ButtonTag.Accept)}
                  onClick={this.onClickButton(ButtonTag.Accept)}
                  text="Accept"
                  className="squareButton acceptButton"
                  enabled={isEnabled(ButtonTag.Accept)}
                />
              </div>
              <div>
                <Button
                  visible={isVisible(ButtonTag.Swap)}
                  onClick={this.onClickButton(ButtonTag.Swap)}
                  text="Swap"
                  className="squareButton emojiButton"
                  enabled={isEnabled(ButtonTag.Swap)}
                />
              </div>
              <div>
                <Button
                  visible={isVisible(ButtonTag.Cancel)}
                  onClick={this.onClickButton(ButtonTag.Cancel)}
                  text="Cancel"
                  className="squareButton emojiButton"
                  enabled={isEnabled(ButtonTag.Cancel)}
                />
              </div>
            </div>
          </div>
        </div>
        <div id="sidebarRight">
          <UsernamePanel currentUser={this.state.currentUser} />
          <UserList
            userList={this.state.userList}
            userInControl={this.state.userInControl}
          />
        </div>
        <div id="bottom">
          <div id="bottomPanel">&nbsp;</div>
        </div>
        <ConnectionStatus isConnected={this.state.isConnected} />
      </div>
    );
  }
}

window.onload = () => {
  const gameKey = getGameKeyFromURL();

  if (gameKey) {
    const mainContainer = document.querySelector("#mainContainer");
    ReactDOM.render(<Main gameKey={gameKey} />, mainContainer);
  } else {
    window.location.assign(generateNewURLWithGameKey());
  }
};
