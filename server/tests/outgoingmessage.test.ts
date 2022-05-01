import { Game, initialGame } from "../src/game";
import {
  afterDisconnect,
  afterGameStart,
  afterTilesApplied,
  afterTileSwap,
  afterUserJoin,
  afterUsernameSet,
  GameOver,
  GameStarted,
  OutgoingMessage,
  UpdateTiles,
  UpdateUserHand,
  UpdateUserInControl,
  UpdateUserList,
} from "../src/outgoingmessage";
import { Set, Map, List } from "immutable";
import { OnlineStatus, UserType, UserWithStatus } from "../../shared/User";
import {
  PositionedTile,
  Tile,
  TileColour,
  TileShape,
} from "../../shared/Domain";

const userId = "userId";
const user: UserWithStatus = {
  onlineStatus: OnlineStatus.online,
  userType: UserType.Player,
  score: 0,
  userId,
  username: "username",
};

const winningUserId = "winningUserId";
const winningUser: UserWithStatus = {
  onlineStatus: OnlineStatus.online,
  userType: UserType.Player,
  score: 10,
  userId: winningUserId,
  username: "winner",
};

describe("afterUserJoin", () => {
  test("with no interesting state", () => {
    const game: Game = {
      ...initialGame,
      users: Map([[userId, user]]),
    };

    const messages = afterUserJoin(game, userId);
    const updateUserList: UpdateUserList = {
      type: "UpdateUserList",
      users: game.users.toArray(),
    };
    expect(messages).toEqual(Set.of(updateUserList));
  });

  test("with some pre existing state", () => {
    const turnTimer = 10;
    const turnStartTime = 1;

    const inControl = winningUserId;

    const placed: PositionedTile = {
      position: { x: 0, y: 0 },
      colour: TileColour.Yellow,
      shape: TileShape.One,
    };

    const tileInHand: Tile = {
      colour: TileColour.Yellow,
      shape: TileShape.One,
    };

    const game: Game = {
      ...initialGame,
      users: Map([
        [userId, user],
        [winningUserId, winningUser],
      ]),
      hands: Map([[userId, List.of(tileInHand)]]),
      isStarted: true,
      turnTimer,
      isOver: true,
      turnStartTime,
      userInControl: inControl,
      tiles: [placed],
      tilesLastPlaced: Set.of(placed),
    };

    const messages = afterUserJoin(game, userId);
    const updateUserList: UpdateUserList = {
      type: "UpdateUserList",
      users: game.users.toArray(),
    };
    const gameStarted: GameStarted = {
      type: "GameStarted",
      turnTimer,
    };
    const gameOver: GameOver = {
      type: "GameOver",
      winningUserId,
    };
    const inControlMessage: UpdateUserInControl = {
      type: "UpdateUserInControl",
      userInControl: inControl,
      turnStartTime,
    };
    const tileUpdate: UpdateTiles = {
      type: "UpdateTiles",
      allTiles: [placed],
      tilesLastPlaced: [placed],
    };
    const handUpdate: UpdateUserHand = {
      type: "UpdateUserHand",
      userId,
      hand: List.of(tileInHand),
    };

    expect(messages).toEqual(
      Set.of<OutgoingMessage>(
        updateUserList,
        gameStarted,
        gameOver,
        inControlMessage,
        tileUpdate,
        handUpdate
      )
    );
  });
});

describe("afterGameStart", () => {
  test("gives the appropriate messages", () => {
    const tileInHand: Tile = {
      colour: TileColour.Yellow,
      shape: TileShape.One,
    };
    const hand = List.of(tileInHand);
    const turnStartTime = 1;
    const turnTimer = 2;
    const game: Game = {
      ...initialGame,
      hands: Map([
        [userId, hand],
        [winningUserId, hand],
      ]),
      userInControl: userId,
      turnStartTime,
      turnTimer,
    };
    const messages = afterGameStart(game);
    const handMessage1: UpdateUserHand = {
      type: "UpdateUserHand",
      userId,
      hand,
    };
    const handMessage2: UpdateUserHand = {
      type: "UpdateUserHand",
      userId: winningUserId,
      hand,
    };
    const inControl: UpdateUserInControl = {
      type: "UpdateUserInControl",
      userInControl: userId,
      turnStartTime,
    };
    const gameStarted: GameStarted = {
      type: "GameStarted",
      turnTimer,
    };
    expect(messages).toEqual(
      Set.of<OutgoingMessage>(
        handMessage1,
        handMessage2,
        inControl,
        gameStarted
      )
    );
  });
});

describe("afterUsernameSet", () => {
  test("sends the appropriate message", () => {
    const users = Map([
      [userId, user],
      [winningUserId, winningUser],
    ]);
    const game: Game = { ...initialGame, users };
    const messages = afterUsernameSet(game);
    const expectedMessage: UpdateUserList = {
      type: "UpdateUserList",
      users: users.toArray(),
    };
    expect(messages).toEqual(Set.of(expectedMessage));
  });
});

describe("afterTileSwap", () => {
  test("sends the appropraite messages", () => {
    const tileInHand: Tile = {
      colour: TileColour.Yellow,
      shape: TileShape.One,
    };
    const hand = List.of(tileInHand);
    const gameOver: GameOver = {
      type: "GameOver",
      winningUserId,
    };
    const game: Game = {
      ...initialGame,
      userInControl: userId,
      turnStartTime: 1,
      hands: Map([
        [userId, hand],
        [winningUserId, hand],
      ]),
    };
    const messages = afterTileSwap(game, userId);
    const inControl: UpdateUserInControl = {
      type: "UpdateUserInControl",
      userInControl: game.userInControl as string,
      turnStartTime: game.turnStartTime,
    };
    const handUpdate: UpdateUserHand = {
      type: "UpdateUserHand",
      userId,
      hand,
    };
    expect(messages).toEqual(Set.of<OutgoingMessage>(inControl, handUpdate));
  });
});

describe("afterTilesApplied", () => {
  test("return the appropriate messages", () => {
    const tileInHand: Tile = {
      colour: TileColour.Yellow,
      shape: TileShape.One,
    };
    const hand = List.of(tileInHand);

    const placed: PositionedTile = {
      position: { x: 0, y: 0 },
      colour: TileColour.Yellow,
      shape: TileShape.One,
    };
    const game: Game = {
      ...initialGame,
      userInControl: userId,
      turnStartTime: 1,
      users: Map([
        [userId, user],
        [winningUserId, winningUser],
      ]),
      hands: Map([
        [userId, hand],
        [winningUserId, hand],
      ]),
      tiles: [placed],
      tilesLastPlaced: Set.of(placed),
      isOver: true,
    };
    const messages = afterTilesApplied(game, userId);
    const inControl: UpdateUserInControl = {
      type: "UpdateUserInControl",
      userInControl: userId,
      turnStartTime: game.turnStartTime,
    };
    const handUpdate: UpdateUserHand = {
      type: "UpdateUserHand",
      userId,
      hand,
    };
    const tileUpdate: UpdateTiles = {
      type: "UpdateTiles",
      allTiles: [placed],
      tilesLastPlaced: [placed],
    };
    const gameOver: GameOver = {
      type: "GameOver",
      winningUserId,
    };
    const userListUpdate: UpdateUserList = {
      type: "UpdateUserList",
      users: game.users.toArray(),
    };
    expect(messages).toEqual(
      Set.of<OutgoingMessage>(
        inControl,
        handUpdate,
        tileUpdate,
        gameOver,
        userListUpdate
      )
    );
  });
});

describe("afterDisconnect", () => {
  test("sends the appropriate message", () => {
    const users = Map([
      [userId, user],
      [winningUserId, winningUser],
    ]);
    const game: Game = { ...initialGame, users };
    const messages = afterDisconnect(game);
    const expectedMessage: UpdateUserList = {
      type: "UpdateUserList",
      users: users.toArray(),
    };
    expect(messages).toEqual(Set.of(expectedMessage));
  });
});
