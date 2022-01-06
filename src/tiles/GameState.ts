import { List, Set } from "immutable";
import {
  Position,
  PositionedTile,
  Rect,
  Success,
  Tile,
  TileColour,
  TileShape,
} from "./domain";
import { MouseClickOrDrag, MouseDrag } from "./Mouse";
import { TileBag } from "./TileBag";
import { TileGrid } from "./TileGrid";

export class GameState {
  constructor(
    public hand: List<Tile>,
    public tileBag: TileBag,
    public canvasRect: Rect,
    public tileGrid: TileGrid,
    public tileGridInProgress: TileGrid,
    public tileGridApplied: TileGrid,
    public mousePosition: Position | undefined,
    public mouseEvents: Array<MouseClickOrDrag>,
    public tilePositionsPressed: Array<Position>,
    public currentPlacementSet: Set<PositionedTile>,
    public pressedButtonTags: Set<string>,
    public enabledButtonTags: Set<string>,
    public panelActiveTileIndicies: Set<number>,
    public mouseDragInProgress: MouseDrag | undefined,
    public panelHoverTileIndex: number | undefined
  ) {}

  setButtonEnabled(tag: string, isEnabled: boolean): void {
    if (isEnabled) this.enabledButtonTags = this.enabledButtonTags.add(tag);
    else this.enabledButtonTags = this.enabledButtonTags.remove(tag);
  }

  setButtonPressed(tag: string, isPressed: boolean): void {
    if (isPressed) this.pressedButtonTags = this.pressedButtonTags.add(tag);
    else this.pressedButtonTags = this.pressedButtonTags.remove(tag);
  }

  setPanelTileActive(index: number, isActive: boolean): void {
    if (isActive)
      this.panelActiveTileIndicies = this.panelActiveTileIndicies.add(index);
    else
      this.panelActiveTileIndicies = this.panelActiveTileIndicies.remove(index);
  }

  static initial(canvasRect: Rect): GameState {
    const tgResult = TileGrid.empty().place(
      Set.of(
        new PositionedTile(
          new Tile(TileColour.Blue, TileShape.Four),
          new Position(0, 0)
        )
      )
    ) as Success;

    var [hand, tileBag] = TileBag.full().take(6);

    return new GameState(
      hand,
      tileBag,
      canvasRect,
      tgResult.tileGrid,
      tgResult.tileGrid,
      tgResult.tileGrid,
      new Position(0, 0),
      [],
      [],
      Set.of(),
      Set.of(),
      Set.of(),
      Set.of(),
      undefined,
      undefined
    );
  }
}
