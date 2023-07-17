import * as BL from "@bl";
import { Control } from "@components/control/control";
import { Pane } from "@components/pane/pane";
import "./tile.scss";

export interface ITileTransform
{
  scale?: number;
}

export interface ITileCoords
{
  left: number;
  top: number;
}

export class Tile extends Control<"div">
{
  private readonly pane: Pane;

  public readonly element: BL.IElement;

  constructor(element: BL.IElement, pane: Pane)
  {
    super("div");

    this.pane = pane;
    this.element = element;

    const selfElement = this.domElement;
    const valueText = element.value.toString();
    selfElement.classList.add("tile", "pane__cell");
    selfElement.setAttribute("data-value", valueText);
    selfElement.innerText = valueText;

    const tileCoords = this.pane.elementPositionToCoords(element.position);
    this.setCoords(tileCoords);
  }

  get boundingClientRect()
  {
    return this.domElement.getBoundingClientRect();
  }

  public setCoords(coords: ITileCoords)
  {
    this.domElement.style.top = `${coords.top}px`;
    this.domElement.style.left = `${coords.left}px`;
  }

  public setValue(value: number)
  {
    const valueText = value.toString();
    this.domElement.setAttribute("data-value", valueText);
    this.domElement.innerText = valueText;
  }

  public transform(options: ITileTransform)
  {
    const { scale } = options;

    let transform = "";

    if (scale !== undefined)
    {
      transform = `scale(${scale})`;
    }

    this.domElement.style.transform = transform;
  }
}
