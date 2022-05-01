import { Map, List, Set } from "immutable";
import { PositionedTile, Tile } from "../../shared/Domain";
import { TileGrid } from "../../shared/TileGrid";
import { User, UserType, OnlineStatus } from "../../shared/User";
import { Game } from "./game";
import { removeFromHand, TileBag } from "./TileBag";

export function onUserJoin(user: User, game: Game): Game {
  const users = game.users.set(user.userId, {
    ...user,
    onlineStatus: OnlineStatus.online,
    userType:
      game.isStarted || game.isOver ? UserType.Spectator : UserType.Player,
    score: game.users.get(user.userId)?.score ?? 0,
  });

  return {
    ...game,
    users,
  };
}

export function onDisconnect(userId: string, game: Game): Game {
  const user = game.users.get(userId);
  if (user) {
    const users = game.users.set(userId, {
      ...user,
      onlineStatus: OnlineStatus.offline,
    });
    return { ...game, users };
  } else {
    return game;
  }
}

export function onUpdateUsername(
  userId: string,
  game: Game,
  newUsername: string
): Game {
  const user = game.users.get(userId);
  if (user) {
    const users = game.users.set(userId, {
      ...user,
      username: newUsername,
    });
    return { ...game, users };
  } else {
    return game;
  }
}

export function onStart(
  game: Game,
  firstUserSelector: (game: Game) => string,
  clock: () => number,
  turnTimer: number | undefined
): Game {
  const initialReduction: [TileBag, Map<string, List<Tile>>] = [
    game.tileBag,
    Map<string, List<Tile>>(),
  ];

  const [nextTileBag, hands] = game.users.reduce<
    [TileBag, Map<string, List<Tile>>]
  >(([tileBag, hands], _unused1, userId, _unused2) => {
    const [hand, nextTileBag] = tileBag.take(6);
    const nextHands = hands.set(userId, hand);
    return [nextTileBag, nextHands];
  }, initialReduction);

  const withoutUserInControl: Game = {
    ...game,
    isStarted: true,
    hands,
    tileBag: nextTileBag,
    turnTimer,
    turnStartTime: clock(),
  };

  return {
    ...withoutUserInControl,
    userInControl: firstUserSelector(withoutUserInControl),
  };
}

export function onSwap(
  game: Game,
  userId: string,
  toSwap: List<Tile>,
  nextUserSelector: (game: Game) => string,
  clock: () => number
): Game {
  const hand = game.hands.get(userId);

  if (hand) {
    const filteredHand = removeFromHand(hand, toSwap);
    const numberRemoved = hand.size - filteredHand.size;
    const [toAdd, newTileBag] = game.tileBag.take(numberRemoved);
    const newHand = filteredHand.concat(toAdd);

    const withoutUserInControl = {
      ...game,
      hands: game.hands.set(userId, newHand),
      tileBag: newTileBag.add(toSwap),
      turnStartTime: clock(),
    };
    return {
      ...withoutUserInControl,
      userInControl: nextUserSelector(withoutUserInControl),
    };
  } else {
    return game;
  }
}

export function onApplyTiles(
  game: Game,
  userId: string,
  toPlace: Set<PositionedTile>,
  nextUserSelector: (game: Game) => string,
  clock: () => number
): Game {
  const hand = game.hands.get(userId);
  const user = game.users.get(userId);
  if (hand && user) {
    const [newTiles, newTileBag] = game.tileBag.take(toPlace.size);
    const newHand = removeFromHand(hand, toPlace).concat(newTiles);

    const res = new TileGrid(game.tiles).place(toPlace);
    if (res.type === "Success") {
      const isGameOver = newHand.size === 0;
      const newScore = user.score + res.score + (isGameOver ? 6 : 0);

      const withoutUserInControl: Game = {
        ...game,
        hands: game.hands.set(userId, newHand),
        tileBag: newTileBag,
        tiles: res.tileGrid.tiles,
        tilesLastPlaced: toPlace,
        users: game.users.set(userId, {
          ...user,
          score: newScore,
        }),
        turnStartTime: clock(),
        isOver: isGameOver,
      };

      return {
        ...withoutUserInControl,
        userInControl: nextUserSelector(withoutUserInControl),
      };
    } else {
      return game;
    }
  } else {
    return game;
  }
}
