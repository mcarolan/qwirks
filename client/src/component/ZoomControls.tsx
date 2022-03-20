import React from "react";

export interface ZoomControlsProps {
  zoomIn: () => void;
  zoomOut: () => void;
}

export function ZoomControls(props: ZoomControlsProps) {
  return (
    <div className="zoom-controls">
      <img src="./images/zoom-in-line.png" onClick={() => props.zoomIn()} />
      <img src="./images/zoom-out-line.png" onClick={() => props.zoomOut()} />
    </div>
  );
}
