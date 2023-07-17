/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ElementValues, IElement, IElementNullable, IElementPosition, IElementTraverse, IProceedResult, MovementDirection } from "./definitions";
import { ElementEventAppearence, ElementEventMovement } from "./events";

const enum VectorMovementsState
{
  vectorMovementsBegin,
  vectorMovementsSequence,
  vectorMovementsUndefined
}

export class Matrix
{
  public static readonly availableSizes = [3, 4, 5];
  private static readonly allDirections = [MovementDirection.Left, MovementDirection.Right, MovementDirection.Up, MovementDirection.Down];

  public readonly length: number;
  public readonly size: number;

  private readonly elements: IElementNullable[];
  private readonly movements: ElementEventMovement[][];
  private readonly vectorPositions: IElementPosition[][][];

  constructor(size: number)
  {
    this.size = size;
    this.length = size * size;
    this.elements = new Array<IElementNullable>(this.length);
    this.elements.fill(null);
    this.movements = Matrix.allDirections.map(() => []);

    const indexes = Array(size).fill(undefined).map((_, i) => i);

    this.vectorPositions = [
      indexes.map(i => indexes.map(j => this.getPosition(j, i))),
      indexes.map(i => indexes.map(j => this.getPosition(size - j - 1, i))),
      indexes.map(i => indexes.map(j => this.getPosition(i, j))),
      indexes.map(i => indexes.map(j => this.getPosition(i, size - j - 1)))
    ];
  }

  public proceed(direction: MovementDirection): IProceedResult | null
  {
    const movementEvents = this.movements[direction];

    if (movementEvents.length === 0)
    {
      return null;
    }

    let scoreIncrement = 0;

    movementEvents.forEach(movementEvent => 
    {
      const { combineToElement, element, sourcePosition, targetPosition } = movementEvent;

      this.elements[sourcePosition.index] = null;
      if (combineToElement === null)
      {
        this.elements[targetPosition.index] = element;
        element.position = targetPosition;
      }
      else
      {
        const value = combineToElement.value + element.value;
        combineToElement.value = value;
        scoreIncrement += value;
      }
    });

    const events = [...movementEvents, ...this.generate()];
    const furtherProceed = this.getAllMovements();
    const values = this.getValues();

    return { events, furtherProceed, justStarted: false, scoreIncrement, values };
  }

  public start(values?: ElementValues): IProceedResult
  {
    let result: IProceedResult;

    const length = this.length;

    if (values !== undefined && length === values.length)
    {
      result = {
        events: [],
        furtherProceed: true,
        justStarted: true,
        scoreIncrement: 0,
        values: { ...values }
      };

      Matrix.traverseArray(this.size, length, values, ({ item: value, position }) =>
      {
        const element: IElementNullable = value === null ? null : { value, position };
        this.elements[position.index] = element;

        if (element !== null)
        {
          result.events.push(new ElementEventAppearence(element));
        }
      });

      result.furtherProceed = this.getAllMovements();
    }
    else
    {
      result = this.restart();
    }

    return result;
  }

  private generate(count = 1): ElementEventAppearence[] 
  {
    const emptyElements = new Array<IElementPosition>(this.length);

    let emptyCount = 0;
    this.traverseAll(elementTraverse =>
    {
      if (elementTraverse.item === null)
      {
        emptyElements[emptyCount++] = elementTraverse.position;
      }
    });

    if (emptyCount < count)
    {
      throw new Error("There are no cell available to generate");
    }

    const result = new Array<ElementEventAppearence>();

    for (let i = 0; i < count; i++)
    {
      const emptyIndex = Math.floor(Math.random() * emptyCount);
      const element: IElement = { position: emptyElements[emptyIndex], value: Math.random() > 0.9 ? 4 : 2 };
      this.elements[element.position.index] = element;
      result.push(new ElementEventAppearence(element));
      emptyElements.splice(emptyIndex, 1);
      emptyCount--;
    }

    return result;
  }

  private getAllMovements(): boolean
  {
    const size = this.size;
    let furtherProceed = false;

    Matrix.allDirections.forEach(direction => 
    {
      const movements = this.movements[direction];
      const vectorPositions = this.vectorPositions[direction];
      movements.length = 0;
      for (let i = 0; i < size; i++)
      {
        this.getVectorMovements(vectorPositions[i], movements);
        furtherProceed ||= movements.length > 0;
      }
    });

    return furtherProceed;
  }

  private getIndex(column: number, row: number): number
  {
    return this.size * row + column;
  }

  private getPosition(column: number, row: number): IElementPosition
  {
    return { column, index: this.getIndex(column, row), row };
  }

  private getVectorMovements(vectorPositions: IElementPosition[], movements: ElementEventMovement[]): void 
  {
    const size = this.size;

    let state: VectorMovementsState = VectorMovementsState.vectorMovementsBegin;
    let j = 0;
    let previousElement: IElement;

    for (let i = 0; i < size; i++)
    {
      const currentElement = this.elements[vectorPositions[i].index];

      switch (state)
      {
        case VectorMovementsState.vectorMovementsBegin: {
          if (currentElement === null)
          {
            state = VectorMovementsState.vectorMovementsUndefined;
          }
          else
          {
            if (j !== i)
            {
              movements.push(new ElementEventMovement(currentElement, vectorPositions[j], null));
            }
            state = VectorMovementsState.vectorMovementsSequence;
            previousElement = currentElement;
          }
          break;
        }
        case VectorMovementsState.vectorMovementsUndefined: {
          if (currentElement !== null)
          {
            movements.push(new ElementEventMovement(currentElement, vectorPositions[j], null));
            state = VectorMovementsState.vectorMovementsSequence;
            previousElement = currentElement;
          }
          break;
        }
        case VectorMovementsState.vectorMovementsSequence: {
          if (currentElement !== null)
          {
            if (currentElement.value === previousElement!.value)
            {
              movements.push(new ElementEventMovement(currentElement, vectorPositions[j++], previousElement!));
              state = VectorMovementsState.vectorMovementsBegin;
            }
            else
            {
              if (++j !== i)
              {
                movements.push(new ElementEventMovement(currentElement, vectorPositions[j], null));
              }
              previousElement = currentElement;
            }
          }
          break;
        }
      }
    }
  }

  private getValues(): ElementValues
  {
    return this.elements.map(element => element !== null ? element.value : null);
  }

  private restart(): IProceedResult
  {
    this.elements.fill(null);

    const events = this.generate(2);
    const furtherProceed = this.getAllMovements();
    const values = this.getValues();

    return { events, furtherProceed, justStarted: true, scoreIncrement: 0, values };
  }

  private traverseAll(fn: (tileTraverse: IElementTraverse<IElementNullable>) => void): void
  {
    Matrix.traverseArray(this.size, this.length, this.elements, fn);
  }

  private static traverseArray<I>(size: number, length: number, array: I[], fn: (tileTraverse: IElementTraverse<I>) => void): void
  {
    let column = 0;
    let row = 0;
    for (let index = 0; index < length; index++)
    {
      fn({ item: array[index], position: { column, index, row } });

      if (++column === size)
      {
        column = 0;
        row++;
      }
    }
  }
}