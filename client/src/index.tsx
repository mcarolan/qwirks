import { Rect, rectFromElement } from "./tiles/domain";

import { plus, Tile } from "../../shared/Domain";
import { Map, Set as ImmSet } from "immutable";
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
import { UserHand } from "./UserHand";
import { GameStatus } from "./GameStatus";
import { ZoomControls } from "./ZoomControls";

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
  hand: List<Tile>;
  activeTileIndicies: ImmSet<number>;
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
      hand: List(),
      activeTileIndicies: ImmSet(),
      currentUser: undefined,
      userInControl: undefined,
    };
  }

  private buttonsClicked: ImmSet<ButtonTag> = ImmSet();
  private handTilesClicked: Array<number> = [];
  private zoomInPressed: number = 0;
  private zoomOutPressed: number = 0;

  onClickButton(buttonTag: ButtonTag): () => void {
    return () => (this.buttonsClicked = this.buttonsClicked.add(buttonTag));
  }

  onHandTileClicked(i: number): void {
    this.handTilesClicked.push(i);
  }

  private shouldUpdateState(gameState: GameState): boolean {
    return (
      !is(this.state.currentUser, gameState.currentUser) ||
      !is(this.state.userList, gameState.userList) ||
      !is(this.state.isConnected, gameState.isConnected) ||
      !is(this.state.isStarted, gameState.isStarted) ||
      !is(this.state.enabledButtonTags, gameState.enabledButtonTags) ||
      !is(this.state.visibleButtonTags, gameState.visibleButtonTags) ||
      !is(this.state.userInControl, gameState.userInControl) ||
      !is(this.state.hand, gameState.hand) ||
      !is(this.state.activeTileIndicies, gameState.panelActiveTileIndicies)
    );
  }

  update(gameState: GameState): void {
    if (this.buttonsClicked.size > 0) {
      gameState.pressedButtonTags = this.buttonsClicked;
      this.buttonsClicked = ImmSet();
    } else {
      gameState.pressedButtonTags = ImmSet();
    }

    if (this.handTilesClicked.length > 0) {
      gameState.panelActiveTileIndicies = gameState.panelActiveTileIndicies.withMutations(
        (m) => {
          for (const i of this.handTilesClicked) {
            if (m.has(i)) {
              m.delete(i);
            } else {
              m.add(i);
            }
          }
        }
      );
      this.handTilesClicked = [];
    }

    const netZoomChange = this.zoomInPressed + this.zoomOutPressed * -1;

    if (netZoomChange != 0) {
      gameState.scale = Math.min(
        Math.max(gameState.scale + netZoomChange * 0.1, 0.5),
        1.5
      );
      this.zoomInPressed = 0;
      this.zoomOutPressed = 0;
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
          hand: gameState.hand,
          activeTileIndicies: gameState.panelActiveTileIndicies,
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

  frame(gameState: GameState, deps: GameDependencies): void {
    gameState.mainAreaBounds = rectFromElement(deps.mainArea);

    deps.context.save();
    deps.canvas.width = gameState.mainAreaBounds.width;
    deps.canvas.height = gameState.mainAreaBounds.height;
    deps.context.clearRect(
      0,
      0,
      deps.context.canvas.width,
      deps.context.canvas.height
    );

    this.update(gameState);
    deps.network.update(gameState);
    deps.mouse.update(gameState);
    deps.tileGrid.update(gameState);
    deps.gameLogic.update(gameState);
    deps.fireworkUpdater.update(gameState);

    deps.context.scale(gameState.scale, gameState.scale);
    deps.tileGrid.draw(deps.context, gameState);
    deps.fireworks.updateAndDraw(deps.context);

    deps.context.restore();

    this.frameId = requestAnimationFrame((_) =>
      this.updateReactState(gameState, deps)
    );
  }

  async componentDidMount() {
    const canvas = document.querySelector("#game") as HTMLCanvasElement;
    const mainArea = document.querySelector("#mainArea") as HTMLElement;
    const mainAreaBounds: Rect = rectFromElement(mainArea);

    canvas.width = mainArea.clientWidth;
    canvas.height = mainArea.clientHeight;

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
      sounds
    );

    const dependencies: GameDependencies = {
      canvas,
      context: canvas.getContext("2d") as CanvasRenderingContext2D,
      mainArea,
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

    document.addEventListener("mousedown", Mouse.updateMouseDown(mouse));
    document.addEventListener("mouseup", Mouse.updateMouseUp(mouse));
    document.addEventListener("mousemove", Mouse.updateMousePosition(mouse));

    this.frameId = requestAnimationFrame((_) =>
      this.frame(
        initialGameState(this.props.gameKey, user, mainAreaBounds),
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

    const bottomClasses = this.state.isStarted
      ? "bottom-expand"
      : "bottom-contracted";

    const firstRowClasses = this.state.isStarted
      ? "firstRow-expand"
      : "firstRow-contracted";

    return (
      <div id="wrapper">
        <div id="firstRow" className={firstRowClasses}>
          <div id="mainArea">
            <GameStatus
              userIsInControl={
                this.state.userInControl === this.state.currentUser?.userId
              }
              waitingForUsername={
                this.state.userInControl
                  ? this.state.userList.get(this.state.userInControl)?.username
                  : undefined
              }
              isStarted={this.state.isStarted}
            />
            <div id="buttonsContainer">
              <ZoomControls
                zoomIn={() => (this.zoomInPressed += 1)}
                zoomOut={() => (this.zoomOutPressed += 1)}
              />
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
        </div>
        <div id="bottom" className={bottomClasses}>
          <div id="bottomPanel">
            <UserHand
              isEnabled={
                this.state.userInControl === this.state.currentUser?.userId
              }
              hand={this.state.hand}
              activeIndicies={this.state.activeTileIndicies}
              onPressed={(i) => this.onHandTileClicked(i)}
            />
          </div>
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
