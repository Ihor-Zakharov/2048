import * as BL from "@bl";
import { Tile } from "@components/tile/tile";
import { config } from "config";
import { Animation } from "./animation";
import { AnimationItem } from "./animationItem";

export class AnimationItemCombination extends AnimationItem<BL.ElementEventMovement>
{
  private targetValue?: number;

  constructor(animation: Animation, event: BL.ElementEventMovement, generation: number, delay: number)
  {
    super(animation, event, generation, delay, config.animation.combinationDuration, Animation.polynomEaseInOutQuad);
  }

  protected override performFirst(): Tile
  {
    const { combineToElement, element } = this.event;
    if (combineToElement === null)
    {
      throw new Error("Combined element is null");
    }

    this.targetValue = combineToElement.value;

    const tile = this.animation.pane.getTile(element);
    const combineToTile = this.animation.pane.getTile(combineToElement);

    tile.detach();

    return combineToTile;
  }

  protected override performSubsequent(tile: Tile, percentDone: number): void
  {
    tile.transform({ scale: 1 + config.animation.combinationScaleAddition * (percentDone < 0.5 ? percentDone : 1 - percentDone) * 2 });
    if (percentDone >= 0.5 && this.targetValue !== undefined)
    {
      tile.setValue(this.targetValue);
      this.targetValue = undefined;
    }
  }

  protected override performLast(tile: Tile): void
  {
    tile.transform({});
    if (this.targetValue !== undefined)
    {
      tile.setValue(this.targetValue);
    }

    this.animation.onCombined(this.event.element.value * 2);
  }
}