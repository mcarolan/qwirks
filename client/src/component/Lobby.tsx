import React from "react";
import { User, UserWithStatus } from "~/../../shared/User";
import { LobbyUserList } from "./LobbyUserList";
import { UsernamePanel } from "./UsernamePanel";
import { Map } from "immutable";
import { Button } from "./Button";


interface LobbyProps {
    currentUser: User;
    onChangeUsername: (newName: string) => void;
    users: Map<string, UserWithStatus>;
    startButtonEnabled: boolean;
    onStartClick: () => void;
  }

export function Lobby(props: LobbyProps) {
    const inviteUrlRef: React.RefObject<HTMLInputElement> = React.createRef();

    function onInviteUrlClick(): void {
        const inviteUrl = inviteUrlRef.current;
        if (inviteUrl) {
            inviteUrl.select();
        }
    }

    return <>
        <h2>1. Invite some mates</h2>
        <p>Here's a link to send them:</p>
        <input ref={inviteUrlRef} type="text" value={window.location.toString()} className="lobbyInviteInput" onClick={() => onInviteUrlClick()} />
        <h2>2. Set your username</h2>
        <UsernamePanel currentUser={props.currentUser} onChangeUsername={props.onChangeUsername} />
        <h2>3. Wait for your buddies to join</h2>
        <LobbyUserList users={props.users} />
        <h2>4. Let's play</h2>
        <div className="lobbyStart">
            <Button visible={true} onClick={() => props.onStartClick()} text="Start" enabled={props.startButtonEnabled} />
        </div>
    </>;
}