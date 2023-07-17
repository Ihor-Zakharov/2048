import { ElementEvent } from "./events";

export interface IElement
{
  position: IElementPosition;
  value: number;
}

export type IElementNullable = IElement | null;

export interface IElementPosition
{
  column: number;
  index: number;
  row: number;
}

export interface IElementTraverse<I>
{
  item: I;
  position: IElementPosition;
}

export const enum MovementDirection
{
  Left,
  Right,
  Up,
  Down
}

export type ElementValues = Array<number | null>;

export interface IProceedResult
{
  events: ElementEvent[];
  furtherProceed: boolean;
  justStarted: boolean;
  scoreIncrement: number;
  values: ElementValues;
}
