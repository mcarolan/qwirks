import React from "react";
import { GameState } from "./tiles/GameState";

interface UsernamePanelProps {
  currentUsername: string | undefined;
}

export function UsernamePanel(props: UsernamePanelProps) {
  return <div>{props.currentUsername ?? "connecting..."}</div>;
}
