import { List, Set } from "immutable";
import { Tile } from "../../../shared/Domain";
import React, { useState } from "react";

interface UserHandProps {
  hand: List<Tile>;
  onPressed: (i: number) => void;
  isEnabled: boolean;
  activeIndicies: Set<number>;
}

export function UserHand(props: UserHandProps) {
  return (
    <div className="hand">
      {props.hand.toArray().map((t, i) => (
        <HandTile
          isEnabled={props.isEnabled}
          tile={t}
          key={i}
          onPressed={() => props.onPressed(i)}
          isActive={props.activeIndicies.contains(i)}
        />
      ))}
    </div>
  );
}

interface HandTileProps {
  tile: Tile;
  onPressed: () => void;
  isActive: boolean;
  isEnabled: boolean;
}

function HandTile(props: HandTileProps) {
  const [isHovering, setHovering] = useState(false);

  const imageUrl = `./images/${props.tile.shape.toString()}-${props.tile.colour.toString()}.png`;
  const tileBackground = props.isActive
    ? "./images/active-tile.png"
    : isHovering
    ? "./images/hover-tile.png"
    : "./images/blank-tile.png";

  const tileClassName = `tile${props.isEnabled ? "" : " tile-disabled"}`;
  return (
    <div
      className={tileClassName}
      onMouseEnter={() => {
        if (props.isEnabled) {
          setHovering(true);
        }
      }}
      onMouseLeave={() => {
        if (props.isEnabled) {
          setHovering(false);
        }
      }}
      onClick={() => {
        if (props.isEnabled) {
          props.onPressed();
        }
      }}
    >
      <img src={tileBackground} className="background" />
      <img src={imageUrl} className="emblem" />
    </div>
  );
}
