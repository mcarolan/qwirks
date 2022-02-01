import React from "react";
import { User } from "../../shared/User";

interface UsernamePanelProps {
  currentUser: User | undefined;
}

export function UsernamePanel(props: UsernamePanelProps) {
  return <div id="usernamePanel">{props.currentUser?.username ?? ""}</div>;
}
