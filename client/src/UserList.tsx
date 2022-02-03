import { Map, List } from "immutable";
import React from "react";
import { UserWithStatus } from "../../shared/User";
import { UserListUser } from "./UserListUser";

interface UserListProps {
  userList: Map<string, UserWithStatus>;
  userInControl: string | undefined;
}
export function UserList(props: UserListProps) {
  const users = List(props.userList.values());

  const userListItems = Array.from(users.sortBy((u) => -u.score)).map(
    (user) => {
      return (
        <UserListUser
          key={user.userId}
          user={user}
          userInControl={props.userInControl}
        />
      );
    }
  );
  return <div>{userListItems}</div>;
}
