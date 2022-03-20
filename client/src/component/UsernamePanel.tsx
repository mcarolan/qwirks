import React, { KeyboardEventHandler, useState } from "react";
import { User } from "../../../shared/User";
import { Button } from "./Button";

interface UsernamePanelProps {
  currentUser: User;
  onChangeUsername: (newName: string) => void;
}

export function UsernamePanel(props: UsernamePanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const username = props.currentUser.username;

  const [inputValue, setInputValue] = useState(username);

  const onKeyPress: KeyboardEventHandler = (ev) => {
    if (ev.key === "Enter" && inputValue.length > 0) {
      props.onChangeUsername(inputValue);
      setInputValue(username);
      setIsEditing(false);
    }
  };

  const textbox = (
    <input
      autoFocus
      onFocus={(e) => e.target.select()}
      type="text"
      onChange={(e) => setInputValue(e.target.value)}
      defaultValue={username}
      onKeyPress={onKeyPress}
    />
  );
  const label = <span onClick={() => setIsEditing(true)}>{username}</span>;
  return <div id="usernamePanel">{isEditing ? textbox : label}</div>;
}
