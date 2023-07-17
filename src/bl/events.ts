import { IElement, IElementNullable, IElementPosition } from "./definitions";

export abstract class ElementEvent
{
  public readonly element: IElement;

  constructor(element: IElement)
  {
    this.element = element;
  }
}

export class ElementEventMovement extends ElementEvent
{
  public readonly combineToElement: IElementNullable;
  public readonly sourcePosition: IElementPosition;
  public readonly targetPosition: IElementPosition;

  constructor(element: IElement, targetPosition: IElementPosition, combineToElement: IElementNullable)
  {
    super(element);
    this.sourcePosition = element.position;
    this.targetPosition = targetPosition;
    this.combineToElement = combineToElement;
  }
}

export class ElementEventAppearence extends ElementEvent
{ }
