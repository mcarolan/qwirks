import { UserWithStatus } from "~/../../shared/User";
import { Map } from "immutable";
import React from "react";
import { OnlineStatusView } from "./OnlineStatusView";

interface LobbyUserListProps {
    users: Map<string, UserWithStatus>
}

export function LobbyUserList(props: LobbyUserListProps) {
    return <div className="lobbyUserList">
        {props.users.toArray().map(([userId, user]) => <div className="lobbyUser" key={userId}><OnlineStatusView value={user.onlineStatus} />{user.username}</div>)}
    </div>
}