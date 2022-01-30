import React from "react";

interface StartButtonProps {
  visible: boolean;
  onClick: () => void;
}

export function StartButton(props: StartButtonProps) {
  const className = props.visible ? "" : "startButton-invisible";
  return (
    <div className="vertical-center">
      <button id="startButton" className={className} onClick={props.onClick}>
        Start Game
      </button>
    </div>
  );
}
