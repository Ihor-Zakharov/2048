import * as BL from "@bl";
import { Pane } from "@components/pane/pane";
import { AnimationItem } from "./animationItem";
import { AnimationItemAppearance } from "./animationItemAppearance";
import { AnimationItemCombination } from "./animationItemCombination";
import { AnimationItemMovement } from "./animationItemMovement";

interface Props
{
  onCombined: (value: number) => void;
  onEnd: () => void;
  pane: Pane;
}

export class Animation
{

  public readonly onCombined: (value: number) => void;
  public readonly onEnd: () => void;
  public readonly pane: Pane;

  private readonly items: AnimationItem<any>[];

  private generation: number;
  private started: number | null;

  constructor({ onCombined, onEnd, pane }: Props)
  {
    this.onEnd = onEnd;
    this.generation = 0;
    this.items = [];
    this.onCombined = onCombined;
    this.pane = pane;
    this.started = null;
  }

  public cancel(): void
  {
    this.items.length = 0;
    this.started = null;
  }

  public perform(events: BL.ElementEvent[]): void
  {
    const generation = ++this.generation;

    let maxDelay = 0;

    for (const event of events)
    {
      if (event instanceof BL.ElementEventMovement)
      {
        const item = new AnimationItemMovement(this, event, generation, 0);
        this.items.push(item);

        const delay = item.duration;
        if (delay > maxDelay)
        {
          maxDelay = delay;
        }

        if (event.combineToElement !== null)
        {
          this.items.push(new AnimationItemCombination(this, event, generation, delay));
        }
      }
      else if (event instanceof BL.ElementEventAppearence)
      {
        // This event will be the last one, so maxDelay has correct value;
        this.items.push(new AnimationItemAppearance(this, event, generation, maxDelay));
      }
    }

    const isStartedAlready = this.started !== null;

    this.started = performance.now();

    if (!isStartedAlready)
    {
      window.requestAnimationFrame(() => this.performFrame());
    }
  }

  public static polynomEaseInOutQuad(x: number): number
  {
    return x < 0.5 ? 2 * x * x : -1 - x * (2 * x - 4);
  }

  public static polynomLinear(x: number): number
  {
    return x;
  }

  private performFrame(): void
  {
    if (this.started !== null)
    {
      const elapsed = performance.now() - this.started;

      let shouldContinue = false;
      for (const item of this.items)
      {
        shouldContinue = item.perform(this.generation, elapsed) || shouldContinue;
      }

      if (shouldContinue)
      {
        window.requestAnimationFrame(() => this.performFrame());
      }
      else
      {
        this.cancel();
        this.onEnd();
      }
    }
  }
}
