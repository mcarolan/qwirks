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
import { UserHand } from "./UserHand";
import { UserList } from "./UserList";
import { Lobby } from "./Lobby";

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
    return () => {
      this.setState((s: MainCompmonentState) => {
        return {
          ...s,
          ui: { ...s.ui, buttonsClicked: s.ui.buttonsClicked.add(buttonTag) },
        };
      })
    };
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
      this.props.gameKey,
      document
    );

    deps.canvas.width = deps.mainArea.clientWidth;
    deps.canvas.height = deps.mainArea.clientHeight;

    requestAnimationFrame(
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

    const isStarted = this.state.game.isStarted;

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
            <div className="main-area">
              { !isStarted ? 
                <Lobby 
                  currentUser={this.state.game.currentUser} 
                  onChangeUsername={(newName) => this.onChangeUsername(newName)}
                  users={this.state.game.userList}
                  startButtonEnabled={!this.state.game.isStarted && this.state.game.userList.size > 1 }
                  onStartClick={this.onClickButton(ButtonTag.Start) } /> : <></> }
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
        <UserList
              userList={this.state.game.userList}
              userInControl={this.state.game.userInControl}
              isStarted={this.state.game.isStarted}
            />
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
    </div>
    );
  }
}
