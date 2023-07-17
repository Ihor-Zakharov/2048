import { t } from "@i18n";
import { BaseScore } from "./baseScore";

interface Props
{
  initialValue: number;
}

export class BestScore extends BaseScore
{
  constructor({ initialValue }: Props)
  {
    super({ initialValue, title: t("bestScore") });
  }

  public applyValue(value: number, force: boolean)
  {
    if (this.value < value || (force && this.value !== value))
    {
      this.setValue(value);
    }
  }
}