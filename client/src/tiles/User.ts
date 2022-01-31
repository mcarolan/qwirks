import { generateUsername } from "unique-username-generator";
import { v4 as uuidv4 } from "uuid";

export interface User {
  userId: string;
  username: string;
}

export enum OnlineStatus {
  online,
  offline,
}

export interface UserWithStatus extends User {
  onlineStatus: OnlineStatus;
}

export function loadUser(): User {
  const localStorageUserIdKey = "userid";
  const userId: string =
    localStorage.getItem(localStorageUserIdKey) ?? uuidv4();
  localStorage.setItem(localStorageUserIdKey, userId);

  const localStorageUsernameKey = "username";
  const username: string =
    localStorage.getItem(localStorageUsernameKey) ?? generateUsername(" ");
  localStorage.setItem(localStorageUsernameKey, username);

  return {
    userId,
    username,
  };
}
