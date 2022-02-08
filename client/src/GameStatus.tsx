import React from "react";

export interface GameStatusProps {
  isStarted: boolean;
  userIsInControl: boolean;
  waitingForUsername: string | undefined;
  winningUsername: string | undefined;
}

export function GameStatus(props: GameStatusProps) {
  let status = "";

  if (!props.isStarted) {
    status = "Invite 2-4 players and press start!";
  } else if (props.winningUsername) {
    status = `Well done ${props.winningUsername}`;
  } else if (props.userIsInControl) {
    status = "It's your go!";
  } else if (props.waitingForUsername) {
    status = `Waiting for ${props.waitingForUsername}...`;
  }
  return <div className="gameStatus">{status}</div>;
}
