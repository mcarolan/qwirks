import React from "react";

export enum ButtonTag {
  Start = "start",
  Accept = "accept",
  Swap = "swap",
  Cancel = "cancel",
}

interface ButtonProps {
  visible: boolean;
  onClick: () => void;
  text: JSX.Element | string;
  className?: string;
  enabled: boolean;
}

export function Button(props: ButtonProps) {
  const contents: JSX.Element =
    typeof props.text === "string" ? <span>{props.text}</span> : props.text;
  const className = `${props.className} ${props.visible ? "" : "displayNone"}`;
  return (
    <button
      disabled={!props.enabled}
      className={className}
      onClick={props.onClick}
    >
      {contents}
    </button>
  );
}
