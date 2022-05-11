import React, { KeyboardEventHandler, useState } from "react";
import { User } from "../../../shared/User";

interface UsernamePanelProps {
  currentUser: User;
  onChangeUsername: (newName: string) => void;
}

export function UsernamePanel(props: UsernamePanelProps) {
  const username = props.currentUser.username;

  const [inputValue, setInputValue] = useState(username);

  const onKeyPress: KeyboardEventHandler = (ev) => {
    if (ev.key === "Enter" && inputValue.length > 0) {
      ev.preventDefault();
      props.onChangeUsername(inputValue);
      setInputValue(username);
    }
  };
  return <div className="lobbyUsername">
    <form>
      <input
      autoFocus
      onFocus={(e) => e.target.select()}
      type="text"
      onChange={(e) => setInputValue(e.target.value)}
      defaultValue={username}
      onKeyPress={onKeyPress}
      />
      <input type="submit" onSubmit={(e) => {
        e.preventDefault();
        props.onChangeUsername(inputValue);
      }} value="Change" />
    </form>
  </div>;
}
