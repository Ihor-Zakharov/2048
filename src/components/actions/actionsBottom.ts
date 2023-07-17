import { ButtonStart, ButtonStartProps } from "@components/buttonStart/buttonStart";
import { Control } from "@components/control/control";
import "./actions.scss";

type Props = ButtonStartProps;

export class ActionsBottom extends Control<"div">
{
  private readonly buttonStart: ButtonStart;

  constructor(props: Props)
  {
    super("div");

    const selfElement = this.domElement;
    selfElement.classList.add("actions", "actions--bottom");

    this.buttonStart = new ButtonStart(props);
    this.buttonStart.parent = this;
  }
}
