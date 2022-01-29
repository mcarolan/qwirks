import React from "react";

interface ConnectionStatusProps {
  isConnected: boolean;
}

export function ConnectionStatus(props: ConnectionStatusProps) {
  return (
    <div
      className={`connectionStatusContainer ${
        props.isConnected
          ? "connectionStatus-Connected"
          : "connectionStatus-Disconnected"
      }`}
    >
      <div className="connectionStatusText">
        <span>Connecting...</span>
      </div>
    </div>
  );
}
