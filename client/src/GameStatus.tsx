import React from "react";
import { utcEpoch } from "../../shared/DateUtils";

export interface GameStatusProps {
  isStarted: boolean;
  userIsInControl: boolean;
  waitingForUsername: string | undefined;
  winningUsername: string | undefined;
  turnTimer: number | undefined;
  turnStartTime: number | undefined;
}

export function GameStatus(props: GameStatusProps) {
  let status = "";

  if (!props.isStarted) {
    status = "Invite 2-4 players and press start!";
  } else if (props.winningUsername) {
    status = `Well done ${props.winningUsername}`;
  } else if (props.userIsInControl) {
    status = "It's your go!";
    if (props.turnTimer && props.turnStartTime) {
      const elapsed = utcEpoch() - props.turnStartTime;
      const remaining = Math.max(0, props.turnTimer - elapsed);
      status = `${status}... ${Math.round(remaining / 1000)}`;
    }
  } else if (props.waitingForUsername) {
    status = `Waiting for ${props.waitingForUsername}...`;
  }
  return <div className="gameStatus">{status}</div>;
}
