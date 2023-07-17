import * as BL from "@bl";
import { ITileCoords, Tile } from "@components/tile/tile";
import { config } from "config";
import { Animation } from "./animation";
import { AnimationItem } from "./animationItem";

export class AnimationItemMovement extends AnimationItem<BL.ElementEventMovement>
{
  private readonly coordsFrom: ITileCoords;
  private readonly coordsTo: ITileCoords;
  private readonly deltaX: number;
  private readonly deltaY: number;

  constructor(animation: Animation, event: BL.ElementEventMovement, generation: number, delay: number)
  {
    const coordsFrom = animation.pane.elementPositionToCoords(event.sourcePosition);
    const coordsTo = animation.pane.elementPositionToCoords(event.targetPosition);

    const deltaX = coordsTo.left - coordsFrom.left;
    const deltaY = coordsTo.top - coordsFrom.top;

    super(animation, event, generation, delay, Math.sqrt(deltaX * deltaX + deltaY * deltaY) / config.animation.movementVelocity, Animation.polynomLinear);

    this.coordsFrom = coordsFrom;
    this.coordsTo = coordsTo;

    this.deltaX = deltaX;
    this.deltaY = deltaY;
  }

  protected performLast(tile: Tile): void
  {
    tile.setCoords(this.coordsTo);
  }

  protected performSubsequent(tile: Tile, percentDone: number): void
  {
    const coords: ITileCoords = { left: Math.round(this.coordsFrom.left + this.deltaX * percentDone), top: Math.round(this.coordsFrom.top + this.deltaY * percentDone) };
    tile.setCoords(coords);
  }
}