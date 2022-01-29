import { Rect, Tile } from "./tiles/domain";

import _ from "lodash";
import { Position } from "./tiles/domain";
import { PanelGraphics, PANEL_HEIGHT } from "./tiles/PanelGraphics";
import { TileGridGraphics } from "./tiles/TileGridGraphics";
import { GameState } from "./tiles/GameState";
import { Mouse } from "./tiles/Mouse";
import { GameLogic } from "./tiles/GameLogic";
import { loadImage, random } from "./tiles/utility";
import { Button } from "./tiles/Button";
import { Score } from "./tiles/Score";
import { Sounds } from "./tiles/Sounds";
import { Fireworks } from "./fireworks/Fireworks";
import { List } from "immutable";
import { TileGraphics } from "./tiles/TileGraphics";
import { io } from "socket.io-client";
import { Network } from "./tiles/Network";
import { User } from "./tiles/User";
import ReactDOM from "react-dom";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { UsernamePanel } from "./UsernamePanel";
import { IGameStateUpdater } from "./IGameStateUpdater";

export enum ButtonTags {
  Accept = "accept",
  Swap = "swap",
  Cancel = "cancel",
}

function Main() {
  const canvas = document.querySelector("#game") as HTMLCanvasElement;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const mainArea = document.querySelector("#mainArea") as HTMLElement;
  const bottomPanel = document.querySelector("#bottomPanel") as HTMLElement;

  const canvasRect = new Rect(
    new Position(mainArea.clientLeft, mainArea.clientTop),
    mainArea.clientWidth,
    mainArea.clientHeight
  );

  var panel: PanelGraphics = new PanelGraphics();

  var tileGrid: TileGridGraphics = new TileGridGraphics();

  const mouse: Mouse = new Mouse();

  document.addEventListener("mousedown", Mouse.updateMouseDown(mouse));
  document.addEventListener("mouseup", Mouse.updateMouseUp(mouse));
  document.addEventListener("mousemove", Mouse.updateMousePosition(mouse));

  const acceptInactive = loadImage("./images/accept-inactive.png");
  const acceptHover = loadImage("./images/accept-hover.png");

  const swapInactive = loadImage("./images/swap-inactive.png");
  const swapHover = loadImage("./images/swap-hover.png");

  const cancelInactive = loadImage("./images/cancel-inactive.png");
  const cancelHover = loadImage("./images/cancel-hover.png");

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

  const score: Score = new Score(new Position(10, 10));

  const fireworks: Fireworks = new Fireworks();

  const socket = io("http://localhost:3000");
  const user = new User();
  const network = new Network(socket, user);

  const sounds = new Sounds();

  const gameLogic = new GameLogic();

  class FireworkUpdater implements IGameStateUpdater {
    update(gameState: GameState): GameState {
      const targets = gameState.fireworkTilePositions.map((tp) =>
        tileGrid
          .tilePositionToScreenCoords(tp, gameState)
          .plus(
            new Position(
              TileGraphics.tileWidth / 2,
              TileGraphics.tileHeight / 2
            )
          )
      );

      const acceptButtonMid = acceptButton.rect.middle();

      targets.forEach((p) => {
        fireworks.create(acceptButtonMid, p);

        var i = 5;

        while (i--) {
          fireworks.create(fireworks.randomOrigin(canvasRect), p);
        }
      });

      if (gameState.scoreJustAchieved > 0) {
        sounds.rises(gameState.scoreJustAchieved);
        gameState.scoreJustAchieved = 0;
      }

      return { ...gameState, fireworkTilePositions: List() };
    }
  }

  const fireworkUpdater = new FireworkUpdater();

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

  const useUsername = () => {
    const [username, setUsername] = useState<string | undefined>(undefined);

    useEffect(() => {
      let frameId: number;
      let gameState: GameState = GameState.initial();

      const frame = (_: DOMHighResTimeStamp) => {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        const nextState = updateGameState(
          {
            ...gameState,
            mainAreaBounds: Rect.from(mainArea),
            bottomPanelBounds: Rect.from(bottomPanel),
          },
          network,
          mouse,
          panel,
          tileGrid,
          acceptButton,
          swapButton,
          cancelButton,
          gameLogic,
          fireworkUpdater
        );
        gameState = nextState;
        setUsername(gameState.username);

        tileGrid.draw(context, gameState);
        panel.draw(context, gameState);
        acceptButton.draw(context, gameState);
        swapButton.draw(context, gameState);
        cancelButton.draw(context, gameState);
        score.draw(context, gameState);
        fireworks.updateAndDraw(context);

        frameId = requestAnimationFrame(frame);
      };

      frameId = requestAnimationFrame(frame);
      return () => cancelAnimationFrame(frameId);
    }, []);

    return username;
  };

  const username = useUsername();

  return <UsernamePanel currentUsername={username} />;
}

const sidebarRight = document.querySelector("#sidebarRight");
ReactDOM.render(<Main />, sidebarRight);
