import React from "react";
import { OnlineStatus, UserWithStatus } from "../../../shared/User";

interface UserListUserProps {
  user: UserWithStatus;
  userInControl: string | undefined;
}

export function UserListUser(props: UserListUserProps) {
  function onlineStatusClassName(onlineStatus: OnlineStatus): string {
    switch (onlineStatus) {
      case OnlineStatus.online:
        return "onlineStatus onlineStatus-Online";
      case OnlineStatus.offline:
        return "onlineStatus onlineStatus-Offline";
    }
  }

  const userInControlClassName: string =
    props.userInControl === props.user.userId
      ? "username user-incontrol"
      : "username user-normal";

  return (
    <div className="userListUser">
      <div className="userListUsername">
        <span className={onlineStatusClassName(props.user.onlineStatus)}></span>
        <span className={userInControlClassName}>{props.user.username}</span>
      </div>
      <div className="userListScore">
        <span className="userScore">{props.user.score}</span>
      </div>
    </div>
  );
}
