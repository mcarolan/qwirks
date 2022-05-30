import { List, Set } from "immutable";
import { Tile } from "../../../shared/Domain";
import React, { useState } from "react";
import { loadTileGraphics } from "../graphics/TileGraphics";

interface UserHandProps {
  hand: List<Tile>;
  onPressed: (i: number) => void;
  isEnabled: boolean;
  activeIndicies: Set<number>;
}

export function UserHand(props: UserHandProps) {
  return (
    <div className="hand">
      <div className="handTiles">
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

  const tileClassName = `tile${props.isEnabled ? "" : " tile-disabled"}`;

  const canvas: React.RefObject<HTMLCanvasElement> = React.createRef();

  React.useEffect(() => {
    const can = canvas.current;
    const context = canvas.current?.getContext('2d');
    const width = canvas.current?.clientWidth;

    if (can && context && width) {
      (async () => {
        can.width = can.offsetWidth;
        can.height = can.offsetHeight;

        const tileGraphics = await loadTileGraphics(context);
        const scale = width / tileGraphics.tileSize;

        if (props.isActive) {
          tileGraphics.drawActiveTile(context, { x: 0, y: 0}, props.tile, scale);
        }
        else {
          if (isHovering) {
            tileGraphics.drawHoverTile(context, { x: 0, y: 0 }, props.tile, scale);
          }
          else { 
            tileGraphics.drawInactiveTile(context, { x: 0, y: 0 }, props.tile, scale);
          }
        }
      })();
    }
  });
  
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
      <canvas ref={canvas} />
    </div>
  );
}
