export interface User {
  userId: string;
  username: string;
}

export enum OnlineStatus {
  online,
  offline,
}

export enum UserType {
  Player,
  Spectator,
}

export interface UserWithStatus extends User {
  onlineStatus: OnlineStatus;
  userType: UserType;
  score: number;
}
