import { Map } from "immutable";
import React from "react";
import { OnlineStatus, UserWithStatus } from "./tiles/User";

interface UserListProps {
  userList: Map<string, UserWithStatus>;
}
export function UserList(props: UserListProps) {
  function statusToString(userStatus: OnlineStatus): string {
    switch (userStatus) {
      case OnlineStatus.online:
        return "Online";
      case OnlineStatus.offline:
        return "Offline";
    }
  }

  const userListItems = Array.from(props.userList.values()).map((user) => {
    return (
      <li key={user.userId}>
        {user.username} ({statusToString(user.onlineStatus)})
      </li>
    );
  });
  return (
    <div>
      <ul>{userListItems}</ul>
    </div>
  );
}
