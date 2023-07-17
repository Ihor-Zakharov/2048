import { ElementValues } from "./definitions";
import { Matrix } from "./matrix";

export type ThemeValue = "dark" | "light" | null;

interface IState
{
  bestScores: Record<string, number | undefined>;
  matrix: ElementValues | null;
  score: number;
  size: number;
  theme: ThemeValue | null;
}

export class State
{
  private static readonly storageKey = "2048-state";

  private static readonly default: IState = {
    bestScores: {},
    matrix: null,
    score: 0,
    size: 4,
    theme: null
  };

  private state: IState;

  constructor()
  {
    this.state = State.load();
  }

  public get bestScore(): number
  {
    return this.state.bestScores[this.size.toString()] ?? 0;
  }

  public get matrix(): ElementValues | undefined
  {
    return this.state.matrix ?? undefined;
  }

  public get score(): number
  {
    return this.state.score;
  }

  public get size(): number
  {
    return this.state.size;
  }

  public get theme(): ThemeValue
  {
    return this.state.theme;
  }

  public set theme(theme: ThemeValue)
  {
    if (this.theme !== theme)
    {
      const state = this.state;
      state.theme = theme;
      State.save(state);
    }
  }

  public reset(size: number)
  {
    const state = this.state;
    state.matrix = null;
    state.score = 0;
    state.size = size;
    State.save(state);
  }

  public update(matrix: ElementValues, scoreIncrement: number)
  {
    const state = this.state;
    const score = state.score + scoreIncrement;

    state.matrix = matrix;
    state.score = score;

    const bestScores = state.bestScores;
    const bestScoreKey = state.size.toString();
    const bestScore = bestScores[bestScoreKey];
    if (bestScore === undefined || bestScore < score)
    {
      bestScores[bestScoreKey] = score;
    }

    State.save(state);
  }

  private static load(): IState
  {
    const state: IState = { ...State.default, bestScores: { ...State.default.bestScores } };

    const storedText = localStorage.getItem(State.storageKey);
    if (storedText !== null)
    {
      try
      {
        const storedState = JSON.parse(storedText);
        if (typeof storedState === "object")
        {
          const size = storedState.size;
          if (typeof size === "number" && Matrix.availableSizes.includes(size))
          {
            state.size = size;
          }

          const matrix = storedState.matrix;
          if (Array.isArray(matrix) && matrix.length === state.size * state.size && matrix.every(e => typeof e === "number" || e === null))
          {
            state.matrix = matrix;
          }

          const theme = storedState.theme;
          if (theme === "dark" || theme === "light")
          {
            state.theme = theme;
          }

          const score = storedState.score;
          if (typeof score === "number" && Number.isInteger(score) && score >= 0)
          {
            state.score = score;
          }

          const bestScores = storedState.bestScores;
          if (typeof bestScores === "object")
          {
            Matrix.availableSizes.forEach(size =>
            {
              const bestScoreKey = size.toString();
              const bestScore = bestScores[bestScoreKey];
              if (typeof bestScore === "number" && Number.isInteger(bestScore) && bestScore >= 0)
              {
                state.bestScores[bestScoreKey] = bestScore;
              }
            });
          }
        }
      }
      catch
      { }
    }

    return state;
  }

  private static save(state: IState): void
  {
    localStorage.setItem(State.storageKey, JSON.stringify(state));
  }
}