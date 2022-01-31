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
