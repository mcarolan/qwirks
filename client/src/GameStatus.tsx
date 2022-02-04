import React from "react";

export interface GameStatusProps {
  isStarted: boolean;
  userIsInControl: boolean;
  waitingForUsername: string | undefined;
}

export function GameStatus(props: GameStatusProps) {
  const status = props.isStarted
    ? props.userIsInControl
      ? "It's your go!"
      : `Waiting for ${props.waitingForUsername}...`
    : "Invite 2-4 players and press start!";
  return <div className="gameStatus">{status}</div>;
}
