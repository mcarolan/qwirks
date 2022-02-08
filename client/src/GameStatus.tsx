import React from "react";

export interface GameStatusProps {
  isStarted: boolean;
  userIsInControl: boolean;
  waitingForUsername: string | undefined;
  winningUsername: string | undefined;
}

export function GameStatus(props: GameStatusProps) {
  let status = "Invite 2-4 players and press start!";

  if (props.userIsInControl) {
    status = "It's your go!";
  }

  if (props.waitingForUsername) {
    status = `Waiting for ${props.waitingForUsername}...`;
  }

  if (props.winningUsername) {
    status = `Well done ${props.winningUsername}`;
  }

  return <div className="gameStatus">{status}</div>;
}
