import React from "react";
import { UserWithStatus } from "../../../shared/User";
import { OnlineStatusView } from "./OnlineStatusView";

interface UserListUserProps {
  user: UserWithStatus;
  userInControl: string | undefined;
}

export function UserListUser(props: UserListUserProps) {
  const userInControlClassName: string =
    props.userInControl === props.user.userId
      ? "username user-incontrol"
      : "username user-normal";

  return (
    <div className="userListUser">
      <div className="userListUsername">
        <OnlineStatusView value={props.user.onlineStatus} />
        <span className={userInControlClassName}>{props.user.username}</span>
      </div>
      <div className="userListScore">
        <span className="userScore">{props.user.score}</span>
      </div>
    </div>
  );
}
