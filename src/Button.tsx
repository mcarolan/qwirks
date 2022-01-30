import React from "react";

interface ButtonProps {
  visible: boolean;
  onClick: () => void;
  text: JSX.Element | string;
  className?: string;
}

export function Button(props: ButtonProps) {
  const contents: JSX.Element =
    typeof props.text === "string" ? <span>{props.text}</span> : props.text;
  const className = `${props.className} ${props.visible ? "" : "displayNone"}`;
  return (
    <button className={className} onClick={props.onClick}>
      {contents}
    </button>
  );
}
