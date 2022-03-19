import { Set as ImmSet } from "immutable";
import React from "react";
import ReactDOM from "react-dom";
import { User } from "../../shared/User";
import {
  generateNewURLWithGameKey,
  getGameKeyFromURL,
  loadUserFromLocalStorage
} from "./browser/BrowserAPI";
import { Button } from "./Button";
import { ButtonTag } from "./button/ButtonTag";
import { ConnectionStatus } from "./ConnectionStatus";
import { frame } from "./Frame";
import { loadGameDependencies } from "./GameDependencies";
import { GameStatus } from "./GameStatus";
import {
  initialMainState,
  MainState
} from "./MainState";
import { rectFromElement } from "./tiles/domain";
import { initialGameState } from "./tiles/GameState";
import { Mouse } from "./tiles/Mouse";
import { UserHand } from "./UserHand";
import { UserList } from "./UserList";
import { UsernamePanel } from "./UsernamePanel";
import { ZoomControls } from "./ZoomControls";

interface MainProps {
  gameKey: string;
  user: User;
}

export class Main
  extends React.Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);
    this.state = initialMainState;
  }

  public buttonsClicked: ImmSet<ButtonTag> = ImmSet();
  public handTilesClicked: Array<number> = [];
  public zoomInPressed: number = 0;
  public zoomOutPressed: number = 0;
  public selectedTurnTimer: number | undefined;
  public setUsername: string | undefined = undefined;

  onClickButton(buttonTag: ButtonTag): () => void {
    return () => (this.buttonsClicked = this.buttonsClicked.add(buttonTag));
  }

  onHandTileClicked(i: number): void {
    this.handTilesClicked.push(i);
  }

  async componentDidMount() {
    const deps = await loadGameDependencies(
      this.props.user,
      this.props.gameKey,
      this
    );

    deps.canvas.width = deps.mainArea.clientWidth;
    deps.canvas.height = deps.mainArea.clientHeight;

    document.addEventListener("mousedown", Mouse.updateMouseDown(deps.mouse));
    document.addEventListener("mouseup", Mouse.updateMouseUp(deps.mouse));
    document.addEventListener(
      "mousemove",
      Mouse.updateMousePosition(deps.mouse)
    );
    document.addEventListener("wheel", Mouse.updateMouseWheel(deps.mouse));

    requestAnimationFrame((_) =>
      frame(
        initialGameState(
          this.props.gameKey,
          this.props.user,
          rectFromElement(deps.mainArea)
        ),
        deps,
        this
      )
    );
  }
  
  render() {
    const isEnabled = (tag: ButtonTag) =>
      this.state.enabledButtonTags.contains(tag);

    const isVisible = (tag: ButtonTag) =>
      this.state.visibleButtonTags.contains(tag);

    const bottomClasses = this.state.isStarted
      ? "bottom-expand"
      : "bottom-contracted";

    const wrapperClasses = this.state.isStarted
      ? "wrapper-expand"
      : "wrapper-contracted";

    return (
      <div id="wrapper" className={wrapperClasses}>
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
            winningUsername={
              this.state.winner
                ? this.state.userList.get(this.state.winner)?.username
                : undefined
            }
            isStarted={this.state.isStarted}
            turnTimer={this.state.turnTimer}
            turnStartTime={this.state.turnStartTime}
          />
          <div id="buttonsContainer">
            <ZoomControls
              zoomIn={() => (this.zoomInPressed += 1)}
              zoomOut={() => (this.zoomOutPressed += 1)}
            />
            <div className="main-buttons">
              <select
                className={isVisible(ButtonTag.Start) ? "" : "displayNone"}
                onChange={(e) => {
                  const roundTimer: number | undefined = e.target.value
                    ? parseInt(e.target.value)
                    : undefined;
                  this.selectedTurnTimer = roundTimer;
                }}
              >
                <option value={undefined}>No round timer</option>
                <option value={10000}>10 seconds</option>
                <option value={20000}>20 seconds</option>
                <option value={30000}>30 seconds</option>
                <option value={60000}>1 minute</option>
                <option value={120000}>2 minutes</option>
              </select>
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
                  text={<img src="./images/accept.png" />}
                  className="squareButton"
                  enabled={isEnabled(ButtonTag.Accept)}
                />
              </div>
              <div>
                <Button
                  visible={isVisible(ButtonTag.Swap)}
                  onClick={this.onClickButton(ButtonTag.Swap)}
                  text={<img src="./images/swap.png" />}
                  className="squareButton"
                  enabled={isEnabled(ButtonTag.Swap)}
                />
              </div>
              <div>
                <Button
                  visible={isVisible(ButtonTag.Cancel)}
                  onClick={this.onClickButton(ButtonTag.Cancel)}
                  text={<img src="./images/cross.png" />}
                  className="squareButton"
                  enabled={isEnabled(ButtonTag.Cancel)}
                />
              </div>
              <div className="tilesRemainingWrapper">
                <div className="tilesRemaining">
                  {108 - this.state.tilesPlaced} tiles to place
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="sidebarRight">
          <UsernamePanel
            currentUser={this.state.currentUser}
            onChangeUsername={(newName: string) => (this.setUsername = newName)}
          />
          <div id="userList">
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
    ReactDOM.render(
      <Main gameKey={gameKey} user={loadUserFromLocalStorage()} />,
      mainContainer
    );
  } else {
    window.location.assign(generateNewURLWithGameKey());
  }
};
