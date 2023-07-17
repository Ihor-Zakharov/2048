import * as BL from "@bl";
import { Tile } from "@components/tile/tile";
import { config } from "config";
import { Animation } from "./animation";
import { AnimationItem } from "./animationItem";

export class AnimationItemAppearance extends AnimationItem<BL.ElementEventAppearence>
{
  constructor(animation: Animation, event: BL.ElementEventAppearence, generation: number, delay: number)
  {
    super(animation, event, generation, delay, config.animation.appearenceDuration, Animation.polynomEaseInOutQuad);
  }

  protected override performFirst(): Tile
  {
    const tile = new Tile(this.event.element, this.animation.pane);
    tile.transform({ scale: 0 });
    this.animation.pane.addTile(tile);
    return tile;
  }

  protected override performLast(tile: Tile): void
  {
    tile.transform({});
  }

  protected override performSubsequent(tile: Tile, percentDone: number): void
  {
    tile.transform({ scale: percentDone });
  }
}