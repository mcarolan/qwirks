import { List, Set } from "immutable";
import { PositionedTile, Tile } from "../../shared/Domain";
import { UserWithStatus } from "../../shared/User";
import { Game } from "./game";

export interface UpdateUserHand {
  type: "UpdateUserHand";
  userId: string;
  hand: List<Tile>;
}

export interface UpdateUserInControl {
  type: "UpdateUserInControl";
  userInControl: string;
  turnStartTime: number | undefined;
}

export interface GameStarted {
  type: "GameStarted";
  turnTimer: number | undefined;
}

export interface GameOver {
  type: "GameOver";
  winningUserId: string;
}

export interface UpdateTiles {
  type: "UpdateTiles";
  allTiles: PositionedTile[];
  tilesLastPlaced: PositionedTile[];
}

export interface UpdateUserList {
  type: "UpdateUserList";
  users: [string, UserWithStatus][];
}

export type OutgoingMessage =
  | UpdateUserInControl
  | UpdateUserInControl
  | GameStarted
  | GameOver
  | UpdateTiles
  | UpdateUserList
  | UpdateUserHand;

export function afterUserJoin(
  game: Game,
  userId: string
): Set<OutgoingMessage> {
  const userListUpdate: UpdateUserList = {
    type: "UpdateUserList",
    users: game.users.toArray(),
  };
  var messages = Set.of<OutgoingMessage>(userListUpdate);

  if (game.isStarted) {
    const gameStarted: GameStarted = {
      type: "GameStarted",
      turnTimer: game.turnTimer,
    };
    messages = messages.add(gameStarted);
  }

  if (game.isOver) {
    const winningUserId: string = List(game.users.entries()).maxBy(
      ([_, u]) => u.score
    )?.[0] as string;
    const gameOver: GameOver = {
      type: "GameOver",
      winningUserId,
    };
    messages = messages.add(gameOver);
  }

  if (game.tiles.length > 0) {
    const updateTiles: UpdateTiles = {
      type: "UpdateTiles",
      allTiles: game.tiles,
      tilesLastPlaced: game.tilesLastPlaced.toArray(),
    };
    messages = messages.add(updateTiles);
  }

  if (game.userInControl) {
    const inControl: UpdateUserInControl = {
      type: "UpdateUserInControl",
      userInControl: game.userInControl,
      turnStartTime: game.turnStartTime,
    };
    messages = messages.add(inControl);
  }

  const hand = game.hands.get(userId);

  if (hand) {
    const handUpdate: UpdateUserHand = {
      type: "UpdateUserHand",
      userId,
      hand,
    };
    messages = messages.add(handUpdate);
  }

  return messages;
}

export function afterGameStart(game: Game): Set<OutgoingMessage> {
  const handUpdates = game.hands
    .map<UpdateUserHand>((hand, userId) => {
      return {
        type: "UpdateUserHand",
        userId,
        hand,
      };
    })
    .values();
  const inControl: UpdateUserInControl = {
    type: "UpdateUserInControl",
    userInControl: game.userInControl as string,
    turnStartTime: game.turnStartTime,
  };
  const started: GameStarted = {
    type: "GameStarted",
    turnTimer: game.turnTimer,
  };
  return Set<OutgoingMessage>(handUpdates).add(inControl).add(started);
}

export function afterUsernameSet(game: Game): Set<OutgoingMessage> {
  const userUpdate: UpdateUserList = {
    type: "UpdateUserList",
    users: game.users.toArray(),
  };
  return Set.of(userUpdate);
}

export function afterTileSwap(
  game: Game,
  userId: string
): Set<OutgoingMessage> {
  const inControl: UpdateUserInControl = {
    type: "UpdateUserInControl",
    userInControl: game.userInControl as string,
    turnStartTime: game.turnStartTime,
  };
  var messages = Set.of<OutgoingMessage>(inControl);
  const hand = game.hands.get(userId);
  if (hand) {
    const handUpdate: UpdateUserHand = {
      type: "UpdateUserHand",
      userId,
      hand,
    };
    messages = messages.add(handUpdate);
  }
  return messages;
}

export function afterTilesApplied(
  game: Game,
  userId: string
): Set<OutgoingMessage> {
  const inControl: UpdateUserInControl = {
    type: "UpdateUserInControl",
    userInControl: game.userInControl as string,
    turnStartTime: game.turnStartTime,
  };

  const userListUpdate: UpdateUserList = {
    type: "UpdateUserList",
    users: game.users.toArray(),
  };

  var messages = Set.of<OutgoingMessage>(inControl, userListUpdate);

  const hand = game.hands.get(userId);
  if (hand) {
    const handUpdate: UpdateUserHand = {
      type: "UpdateUserHand",
      userId,
      hand,
    };
    messages = messages.add(handUpdate);
  }

  if (game.tiles.length > 0) {
    const updateTiles: UpdateTiles = {
      type: "UpdateTiles",
      allTiles: game.tiles,
      tilesLastPlaced: game.tilesLastPlaced.toArray(),
    };
    messages = messages.add(updateTiles);
  }

  if (game.isOver) {
    const winningUserId: string = List(game.users.entries()).maxBy(
      ([_, u]) => u.score
    )?.[0] as string;
    const gameOver: GameOver = {
      type: "GameOver",
      winningUserId,
    };
    messages = messages.add(gameOver);
  }

  return messages;
}

export function afterDisconnect(game: Game): Set<OutgoingMessage> {
  const userUpdate: UpdateUserList = {
    type: "UpdateUserList",
    users: game.users.toArray(),
  };
  return Set.of(userUpdate);
}
