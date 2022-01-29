import { Map } from "immutable";
import React from "react";
import { UserWithStatus } from "./tiles/User";
import { UserListUser } from "./UserListUser";

interface UserListProps {
  userList: Map<string, UserWithStatus>;
}
export function UserList(props: UserListProps) {
  const userListItems = Array.from(props.userList.values()).map((user) => {
    return <UserListUser user={user} />;
  });
  return <div>{userListItems}</div>;
}
