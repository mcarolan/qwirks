import { generateUsername } from "unique-username-generator";
import { v4 as uuidv4 } from "uuid";
import { User } from "~/../../shared/User";

export function loadUserFromLocalStorage(): User {
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

export function changeUsernameInLocalStorage(newUsername: string) {
  const localStorageUsernameKey = "username";
  localStorage.setItem(localStorageUsernameKey, newUsername);
}

export function getGameKeyFromURL(): string | null {
  const url = new URL(document.location.toString());
  return url.searchParams.get("gameKey");
}

export function generateNewURLWithGameKey(): URL {
  const url = new URL(document.location.toString());
  url.searchParams.set("gameKey", generateUsername("-"));
  return url;
}
