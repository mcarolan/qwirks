import { OnlineStatus, UserWithStatus } from "./tiles/User";
import React from "react";

interface UserListUserProps {
  user: UserWithStatus;
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
  return (
    <div className="userListUser">
      <span className={onlineStatusClassName(props.user.onlineStatus)}></span>
      {props.user.username}
    </div>
  );
}
