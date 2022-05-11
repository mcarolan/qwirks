import { Map } from "immutable";
import { OnlineStatus, User, UserType, UserWithStatus } from "../../shared/User";

export class Lobby {
    private users: Map<string, Map<string, UserWithStatus>> = Map();

    onUserJoin(user: User, gameKey: string): Map<string, UserWithStatus> {
        let gameUsers: Map<string, UserWithStatus> | undefined = this.users.get(gameKey);

        const userWithStatus: UserWithStatus = {
            ...user,
            score: 0,
            onlineStatus: OnlineStatus.online,
            userType: UserType.Player
        };

        gameUsers = (gameUsers ?? Map()).set(userWithStatus.userId, userWithStatus);
        this.users = this.users.set(gameKey, gameUsers);
        return gameUsers;
    }

    onUserChangeName(userId: string, gameKey: string, newName: string): Map<string, UserWithStatus> {
        let gameUsers: Map<string, UserWithStatus> | undefined = this.users.get(gameKey);
        const unknownUser = { userId, username: newName, score: 0, onlineStatus: OnlineStatus.online, userType: UserType.Player };

        if (gameUsers) {
            const prevUser = gameUsers.get(userId);
            const user = {
                ...(prevUser ?? unknownUser),
                username: newName
            };

            console.log(`set username ${JSON.stringify(user)}`)
            gameUsers = gameUsers.set(userId, user);
        }
        else {
            gameUsers = Map([[userId, unknownUser]]);
        }
        this.users = this.users.set(gameKey, gameUsers);
        return gameUsers;
    }

    onUserDisconnect(userId: string, gameKey: string): Map<string, UserWithStatus> {
        let gameUsers: Map<string, UserWithStatus> | undefined = this.users.get(gameKey);
        const unknownOfflineUser = { userId, username: "unknown", score: 0, onlineStatus: OnlineStatus.offline, userType: UserType.Player };

        if (gameUsers) {
            const prevUser = gameUsers.get(userId);
            const user = {
                ...(prevUser ?? unknownOfflineUser),
                onlineStatus: OnlineStatus.offline
            };
            gameUsers = gameUsers.set(userId, user);
        }
        else {
            gameUsers = Map([[userId, unknownOfflineUser]]);
        }
        this.users = this.users.set(gameKey, gameUsers);
        return gameUsers;
    }

    clearLobby(gameKey: string): Map<string, UserWithStatus> {
        const gameUsers = this.users.get(gameKey);

        if (gameUsers) {
            this.users = this.users.remove(gameKey);
            return gameUsers;
        }
        else {
            return Map();
        }
    }
}