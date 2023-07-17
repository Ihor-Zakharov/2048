import { ButtonSettings, ButtonSettingsProps } from "@components/buttonSettings/buttonSettings";
import { Control } from "@components/control/control";
import { BestScore } from "@components/score/bestScore";
import { Score } from "@components/score/score";
import "./actions.scss";

interface Props extends ButtonSettingsProps
{
  initialScore: number;
  initialBestScore: number;
}

export class ActionsTop extends Control<"div">
{
  private readonly bestScore: BestScore;
  private readonly score: Score;
  private readonly settings: ButtonSettings;

  constructor(props: Props)
  {
    super("div");

    const selfElement = this.domElement;
    selfElement.classList.add("actions", "actions--top");

    this.settings = new ButtonSettings(props);
    this.settings.parent = this;

    const scores = document.createElement("div");
    scores.classList.add("actions__scores");
    selfElement.appendChild(scores);

    this.score = new Score({ initialValue: props.initialScore });
    this.score.setParent(scores);

    this.bestScore = new BestScore({ initialValue: props.initialBestScore });
    this.bestScore.setParent(scores);
  }

  public incrementScore(value: number): number
  {
    value = this.score.increment(value);
    this.bestScore.applyValue(value, false);
    return value;
  }

  public resetScore(): void
  {
    this.score.reset();
  }

  public setBestScore(value: number): void
  {
    this.bestScore.applyValue(value, true);
  }
}
