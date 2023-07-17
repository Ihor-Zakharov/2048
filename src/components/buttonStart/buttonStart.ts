import { Control } from "@components/control/control";
import "./buttonStart.scss";

export interface ButtonStartProps
{
  onRestart: () => void;
  title: string
}

export class ButtonStart extends Control<"button">
{
  constructor({ onRestart, title }: ButtonStartProps)
  {
    super("button");

    const selfElement = this.domElement;
    selfElement.setAttribute("type", "button");
    selfElement.classList.add("buttonStart");
    selfElement.innerText = title;

    selfElement.addEventListener("click", onRestart);
  }
}
