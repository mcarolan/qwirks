import { Map, List } from "immutable";
import React, { createRef, RefObject, useEffect } from "react";
import { UserWithStatus } from "../../../shared/User";
import { UserListUser } from "./UserListUser";

interface UserListProps {
  userList: Map<string, UserWithStatus>;
  userInControl: string | undefined;
  isStarted: boolean;
}
export function UserList(props: UserListProps) {
  const users = List(props.userList.values());

  const userListDiv: React.RefObject<HTMLDivElement> = createRef();

  useEffect(() => {
    const userList = userListDiv.current;
    if (userList && props.isStarted) {
      userList.className = "userListVisible";
    }
  }, [props.userInControl]);

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

  const onAnimationEnd = () => {
    const userList = userListDiv.current;
    if (userList) {
      userList.className = "";
    }
  };
  return <div ref={userListDiv} id="userList" onAnimationEnd={() => onAnimationEnd()}>
    <div className="userListContents">
      <h1>Scores</h1>
      <div>{userListItems}</div>
    </div>
  </div>;
}
