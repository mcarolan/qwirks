import React from "react";
import { OnlineStatus } from "../../../shared/User";

interface OnlineStatusViewProps {
    value: OnlineStatus;
}

export function OnlineStatusView(props: OnlineStatusViewProps) {
    function onlineStatusClassName(onlineStatus: OnlineStatus): string {
      switch (onlineStatus) {
        case OnlineStatus.online:
          return "onlineStatus onlineStatus-Online";
        case OnlineStatus.offline:
          return "onlineStatus onlineStatus-Offline";
      }
    }

    return <span className={onlineStatusClassName(props.value)}></span>;
}