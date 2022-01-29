import { Map } from "immutable";
import React from "react";

interface UserListProps {
  userList: Map<string, string>;
}
export function UserList(props: UserListProps) {
  const userListItems = Array.from(props.userList.entries()).map(
    ([userId, username]) => {
      return <li>{username}</li>;
    }
  );
  return (
    <div>
      <ul>{userListItems}</ul>
    </div>
  );
}
