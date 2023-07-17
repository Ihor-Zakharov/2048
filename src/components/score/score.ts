import { t } from "@i18n";
import { BaseScore } from "./baseScore";

interface Props
{
  initialValue: number;
}

export class Score extends BaseScore
{
  constructor({ initialValue }: Props)
  {
    super({ initialValue, title: t("score") });
  }

  public increment(value: number): number
  {
    let result = this.value;
    if (value > 0)
    {
      result += value;
      this.setValue(result);
    }
    return result;
  }

  public reset(): void
  {
    if (this.value !== 0)
    {
      this.setValue(0);
    }
  }
}