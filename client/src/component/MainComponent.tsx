import React, { ChangeEvent } from "react";
import { User } from "../../../shared/User";
import { Button } from "../component/Button";
import { ButtonTag } from "./Button";
import { ConnectionStatus } from "../component/ConnectionStatus";
import { frame } from "../game/Frame";
import { loadGameDependencies } from "../game/GameDependencies";
import { GameStatus } from "../component/GameStatus";
import {
  initialMainComponentState,
  MainCompmonentState,
} from "../state/MainComponentState";
import { rectFromElement } from "../graphics/domain";
import { initialGameState } from "../state/GameState";
import { Mouse } from "../game/Mouse";
import { UserHand } from "./UserHand";
import { UserList } from "./UserList";
import { UsernamePanel } from "./UsernamePanel";
import { ZoomControls } from "./ZoomControls";

interface MainProps {
  gameKey: string;
  user: User;
}

export class MainComponent extends React.Component<
  MainProps,
  MainCompmonentState
> {
  constructor(props: MainProps) {
    super(props);
    this.state = initialMainComponentState;
  }

  onClickButton(buttonTag: ButtonTag): () => void {
    return () =>
      this.setState((s: MainCompmonentState) => {
        return {
          ...s,
          ui: { ...s.ui, buttonsClicked: s.ui.buttonsClicked.add(buttonTag) },
        };
      });
  }

  onHandTileClicked(i: number): void {
    this.setState((s: MainCompmonentState) => {
      return {
        ...s,
        ui: { ...s.ui, handTilesClicked: s.ui.handTilesClicked.add(i) },
      };
    });
  }

  onSelectedTurnTimerChanged(e: ChangeEvent<HTMLSelectElement>): void {
    const roundTimer: number | undefined = e.target.value
      ? parseInt(e.target.value)
      : undefined;
    this.setState((s: MainCompmonentState) => {
      return {
        ...s,
        ui: { ...s.ui, selectedTurnTimer: roundTimer },
      };
    });
  }

  onChangeUsername(newName: string): void {
    this.setState((s: MainCompmonentState) => {
      return {
        ...s,
        ui: { ...s.ui, setUsername: newName },
      };
    });
  }

  async componentDidMount() {
    const deps = await loadGameDependencies(
      this.props.user,
      this.props.gameKey
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
      this.state.game.enabledButtonTags.contains(tag);

    const isVisible = (tag: ButtonTag) =>
      this.state.game.visibleButtonTags.contains(tag);

    const bottomClasses = this.state.game.isStarted
      ? "bottom-expand"
      : "bottom-contracted";

    const wrapperClasses = this.state.game.isStarted
      ? "wrapper-expand"
      : "wrapper-contracted";

    return (
      <div id="wrapper" className={wrapperClasses}>
        <div id="mainArea">
          <GameStatus
            userIsInControl={
              this.state.game.userInControl ===
              this.state.game.currentUser?.userId
            }
            waitingForUsername={
              this.state.game.userInControl
                ? this.state.game.userList.get(this.state.game.userInControl)
                    ?.username
                : undefined
            }
            winningUsername={
              this.state.game.winner
                ? this.state.game.userList.get(this.state.game.winner)?.username
                : undefined
            }
            isStarted={this.state.game.isStarted}
            turnTimer={this.state.game.turnTimer}
            turnStartTime={this.state.game.turnStartTime}
          />
          <div id="buttonsContainer">
            <ZoomControls
              zoomIn={() => (this.state.ui.zoomInPressed += 1)}
              zoomOut={() => (this.state.ui.zoomOutPressed += 1)}
            />
            <div className="main-buttons">
              <select
                className={isVisible(ButtonTag.Start) ? "" : "displayNone"}
                onChange={(e) => this.onSelectedTurnTimerChanged(e)}
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
                  {108 - this.state.game.tilesPlaced} tiles to place
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="sidebarRight">
          <UsernamePanel
            currentUser={this.state.game.currentUser}
            onChangeUsername={this.onChangeUsername}
          />
          <div id="userList">
            <UserList
              userList={this.state.game.userList}
              userInControl={this.state.game.userInControl}
            />
          </div>
        </div>
        <div id="bottom" className={bottomClasses}>
          <div id="bottomPanel">
            <UserHand
              isEnabled={
                this.state.game.userInControl ===
                this.state.game.currentUser?.userId
              }
              hand={this.state.game.hand}
              activeIndicies={this.state.game.activeTileIndicies}
              onPressed={(i) => this.onHandTileClicked(i)}
            />
          </div>
        </div>
        <ConnectionStatus isConnected={this.state.game.isConnected} />
      </div>
    );
  }
}
