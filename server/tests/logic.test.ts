import {
  OnlineStatus,
  User,
  UserType,
  UserWithStatus,
} from "../../shared/User";
import { Game, initialGame } from "../src/game";
import {
  onApplyTiles,
  onDisconnect,
  onStart,
  onSwap,
  onUpdateUsername,
  onUserJoin,
} from "../src/logic";
import { List, Map, Set } from "immutable";
import {
  PositionedTile,
  Tile,
  TileColour,
  TileShape,
} from "../../shared/Domain";
import { TileBag } from "../src/TileBag";
import { updateSetAccessor } from "typescript";

describe("onUserJoin", () => {
  test("no pre-existing user", () => {
    const user: User = {
      userId: "userid",
      username: "username",
    };
    const game: Game = initialGame;
    const after = onUserJoin(user, game);

    expect(after.users.size).toBe(1);
    const userValue = after.users.get(user.userId);
    expect(userValue).toBeDefined();
    expect(userValue?.username).toBe(user.username);
    expect(userValue?.userType).toBe(UserType.Player);
    expect(userValue?.score).toBe(0);
    expect(userValue?.onlineStatus).toBe(OnlineStatus.online);
  });

  test("joins as a spectator when started", () => {
    const user: User = {
      userId: "userid",
      username: "username",
    };
    const game: Game = { ...initialGame, isStarted: true };
    const after = onUserJoin(user, game);

    expect(after.users.size).toBe(1);
    const userValue = after.users.get(user.userId);
    expect(userValue?.userType).toBe(UserType.Spectator);
  });


  test("joins as a player when initially a player", () => {
    const user: User = {
      userId: "userid",
      username: "username",
    };
    const initialUser: UserWithStatus = {
      onlineStatus: OnlineStatus.offline,
      userType: UserType.Player,
      score: 0,
      userId: "userid",
      username: "username"
    }
    const game: Game = { ...initialGame, isStarted: true, users: Map([[initialUser.userId, initialUser]]) };
    const after = onUserJoin(user, game);

    expect(after.users.size).toBe(1);
    const userValue = after.users.get(user.userId);
    expect(userValue?.userType).toBe(UserType.Player);
  });

  test("joins as a spectator when over", () => {
    const user: User = {
      userId: "userid",
      username: "username",
    };
    const game: Game = { ...initialGame, isOver: true };
    const after = onUserJoin(user, game);

    expect(after.users.size).toBe(1);
    const userValue = after.users.get(user.userId);
    expect(userValue?.userType).toBe(UserType.Spectator);
  });

  test("with a pre-existing user", () => {
    const existingUser: UserWithStatus = {
      onlineStatus: OnlineStatus.online,
      userType: UserType.Player,
      score: 10,
      userId: "userid",
      username: "username",
    };

    const game: Game = {
      ...initialGame,
      users: Map([[existingUser.userId, existingUser]]),
    };

    const user: User = {
      userId: "userid2",
      username: "username2",
    };
    const after = onUserJoin(user, game);

    expect(after.users.size).toBe(2);
    const userValue = after.users.get(user.userId);
    expect(userValue).toBeDefined();
    expect(userValue?.username).toBe(user.username);
    expect(userValue?.userType).toBe(UserType.Player);
    expect(userValue?.score).toBe(0);
    expect(userValue?.onlineStatus).toBe(OnlineStatus.online);

    expect(after.users.get(existingUser.userId)).toBe(existingUser);
  });

  test("when user rejoins", () => {
    const existingUser: UserWithStatus = {
      onlineStatus: OnlineStatus.offline,
      userType: UserType.Player,
      score: 10,
      userId: "userid",
      username: "username",
    };

    const game: Game = {
      ...initialGame,
      users: Map([[existingUser.userId, existingUser]]),
    };
    const after = onUserJoin(existingUser, game);

    expect(after.users.size).toBe(1);
    const userValue = after.users.get(existingUser.userId);
    expect(userValue).toBeDefined();
    expect(userValue?.username).toBe(existingUser.username);
    expect(userValue?.userType).toBe(UserType.Player);
    expect(userValue?.score).toBe(10);
    expect(userValue?.onlineStatus).toBe(OnlineStatus.online);
  });
});

describe("onDisconnect", () => {
  test("switches a user's online status", () => {
    const existingUser: UserWithStatus = {
      onlineStatus: OnlineStatus.online,
      userType: UserType.Player,
      score: 10,
      userId: "userid",
      username: "username",
    };

    const game: Game = {
      ...initialGame,
      users: Map([[existingUser.userId, existingUser]]),
    };
    const after = onDisconnect(existingUser.userId, game);
    expect(after.users.get(existingUser.userId)).toStrictEqual({
      ...existingUser,
      onlineStatus: OnlineStatus.offline,
    });
  });
});

describe("onUpdateUsername", () => {
  test("updates a username", () => {
    const existingUser: UserWithStatus = {
      onlineStatus: OnlineStatus.online,
      userType: UserType.Player,
      score: 10,
      userId: "userid",
      username: "username",
    };

    const game: Game = {
      ...initialGame,
      users: Map([[existingUser.userId, existingUser]]),
    };
    const newUsername = "username2";
    const after = onUpdateUsername(existingUser.userId, game, newUsername);
    expect(after.users.get(existingUser.userId)).toStrictEqual({
      ...existingUser,
      username: newUsername,
    });
  });
});

describe("onStart", () => {
  test("sets expected state", () => {
    const existingUser1: UserWithStatus = {
      onlineStatus: OnlineStatus.online,
      userType: UserType.Player,
      score: 10,
      userId: "userid",
      username: "username",
    };
    const existingUser2: UserWithStatus = {
      onlineStatus: OnlineStatus.online,
      userType: UserType.Player,
      score: 20,
      userId: "userid2",
      username: "username2",
    };

    const users = Map([
      [existingUser1.userId, existingUser1],
      [existingUser2.userId, existingUser2],
    ])

    const game: Game = {
      ...initialGame,
    };

    const turnTimer = 10000;
    const time = 1;
    const after = onStart(
      users,
      (_) => existingUser1.userId,
      () => time,
      turnTimer
    );

    expect(after.users).toBe(users);
    expect(after.isStarted).toBe(true);
    expect(after.hands.get(existingUser1.userId)).toStrictEqual(
      game.tileBag.contents.take(6)
    );
    expect(after.hands.get(existingUser2.userId)).toStrictEqual(
      game.tileBag.contents.skip(6).take(6)
    );
    expect(after.tileBag.contents).toStrictEqual(
      game.tileBag.contents.skip(12)
    );
    expect(after.turnTimer).toBe(turnTimer);
    expect(after.userInControl).toBe(existingUser1.userId);
    expect(after.turnStartTime).toBe(time);
  });
});

describe("onSwap", () => {
  test("sets expected state", () => {
    const userId = "userid";

    const bagContents = List.of<Tile>(
      { colour: TileColour.Red, shape: TileShape.One },
      { colour: TileColour.Red, shape: TileShape.Two }
    );

    const tileBag = new TileBag(bagContents);

    const hand = List.of<Tile>(
      { colour: TileColour.Blue, shape: TileShape.Six },
      { colour: TileColour.Blue, shape: TileShape.Five },
      { colour: TileColour.Blue, shape: TileShape.Four },
      { colour: TileColour.Blue, shape: TileShape.One },
      { colour: TileColour.Blue, shape: TileShape.Two },
      { colour: TileColour.Blue, shape: TileShape.One }
    );

    const toSwap = hand.skip(4);

    const game: Game = {
      ...initialGame,
      hands: Map([[userId, hand]]),
      tileBag,
    };

    const nextUserId = "next";
    const nextUser: (g: Game) => string = (_) => nextUserId;
    const time = 1;
    const clock: () => number = () => time;

    const after = onSwap(game, userId, toSwap, nextUser, clock);

    expect(after.hands).toStrictEqual(
      Map([[userId, hand.take(4).concat(bagContents)]])
    );

    expect(Set(after.tileBag.contents)).toEqual(Set(toSwap));
    expect(after.userInControl).toEqual(nextUserId);
    expect(after.turnStartTime).toEqual(time);
  });
});

describe("onApplyTiles", () => {
  test("set expected state", () => {
    const userId = "userid";

    const bagContents = List.of<Tile>(
      { colour: TileColour.Red, shape: TileShape.One },
      { colour: TileColour.Red, shape: TileShape.Two }
    );

    const tileBag = new TileBag(bagContents);

    const hand = List.of<Tile>(
      { colour: TileColour.Blue, shape: TileShape.Six },
      { colour: TileColour.Blue, shape: TileShape.Five },
      { colour: TileColour.Blue, shape: TileShape.Four },
      { colour: TileColour.Blue, shape: TileShape.One },
      { colour: TileColour.Blue, shape: TileShape.Two },
      { colour: TileColour.Blue, shape: TileShape.One }
    );

    const toPlace = Set.of<PositionedTile>(
      {
        ...(hand.get(0) as Tile),
        position: { x: 0, y: 0 },
      },
      {
        ...(hand.get(1) as Tile),
        position: { x: 1, y: 0 },
      }
    );

    const user: UserWithStatus = {
      onlineStatus: OnlineStatus.online,
      userType: UserType.Player,
      score: 0,
      userId: userId,
      username: "username",
    };

    const game: Game = {
      ...initialGame,
      hands: Map([[userId, hand]]),
      tileBag,
      users: Map([[userId, user]]),
    };

    const nextUserId = "next";
    const nextUser: (g: Game) => string = (_) => nextUserId;
    const time = 1;
    const clock: () => number = () => time;

    const after = onApplyTiles(game, userId, toPlace, nextUser, clock);
    expect(after.hands.get(userId)).toEqual(hand.skip(2).concat(bagContents));
    expect(after.tileBag.contents).toEqual(List());
    expect(Set(after.tiles)).toEqual(toPlace);
    expect(Set(after.tilesLastPlaced)).toEqual(toPlace);
    expect(after.users.get(userId)?.score).toEqual(2);
    expect(after.userInControl).toBe(nextUserId);
    expect(after.turnStartTime).toBe(time);
    expect(after.isOver).toEqual(false);
  });

  test("ends the game when appropriate", () => {
    const userId = "userid";

    const hand = List.of<Tile>(
      { colour: TileColour.Blue, shape: TileShape.Six },
      { colour: TileColour.Blue, shape: TileShape.Five }
    );

    const toPlace = Set.of<PositionedTile>(
      {
        ...(hand.get(0) as Tile),
        position: { x: 0, y: 0 },
      },
      {
        ...(hand.get(1) as Tile),
        position: { x: 1, y: 0 },
      }
    );

    const user: UserWithStatus = {
      onlineStatus: OnlineStatus.online,
      userType: UserType.Player,
      score: 0,
      userId: userId,
      username: "username",
    };

    const game: Game = {
      ...initialGame,
      hands: Map([[userId, hand]]),
      users: Map([[userId, user]]),
      tileBag: new TileBag(List()),
    };

    const nextUserId = "next";
    const nextUser: (g: Game) => string = (_) => nextUserId;
    const time = 1;
    const clock: () => number = () => time;

    const after = onApplyTiles(game, userId, toPlace, nextUser, clock);
    expect(after.hands.get(userId)).toEqual(List());
    expect(after.tileBag.contents).toEqual(List());
    expect(after.users.get(userId)?.score).toEqual(8);
    expect(after.isOver).toEqual(true);
  });
});
