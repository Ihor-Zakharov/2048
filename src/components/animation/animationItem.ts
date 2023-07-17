import * as BL from "@bl";
import { Tile } from "@components/tile/tile";
import { Animation } from "./animation";

export type AnimationPolynom = (value: number) => number;

export abstract class AnimationItem<E extends BL.ElementEvent>
{
  public readonly animation: Animation;
  public readonly delay: number;
  public readonly duration: number;
  public readonly event: E;
  public readonly generation: number;
  public readonly polynom: AnimationPolynom;

  private tile: Tile | null | undefined; // undefined - animation has not been started yet, null - animation is done.

  constructor(animation: Animation, event: E, generation: number, delay: number, duration: number, polynom: AnimationPolynom)
  {
    this.animation = animation;
    this.delay = delay;
    this.duration = duration;
    this.event = event;
    this.generation = generation;
    this.polynom = polynom;
  }

  public perform(generation: number, elapsed: number): boolean
  {
    elapsed -= this.delay;

    const sameGeneration = this.generation === generation;

    let tile = this.tile;

    if (tile !== null && (!sameGeneration || elapsed >= 0))
    {
      if (tile === undefined)
      {
        tile = this.performFirst();
      }

      if (sameGeneration && elapsed < this.duration)
      {
        const percentDone = this.polynom(elapsed / this.duration);
        this.performSubsequent(tile, percentDone);
      }
      else
      {
        this.performLast(tile);
        tile = null;
      }

      this.tile = tile;
    }

    return tile !== null;
  }

  protected performFirst(): Tile
  {
    return this.animation.pane.getTile(this.event.element);
  }

  protected abstract performLast(tile: Tile): void;
  protected abstract performSubsequent(tile: Tile, percentDone: number): void;
}