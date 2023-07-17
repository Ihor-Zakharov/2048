import { Control } from "@components/control/control";
import "./score.scss";

interface Props
{
  initialValue: number;
  title: string;
}

export abstract class BaseScore extends Control<"div">
{
  protected value: number;

  private readonly valueElement: HTMLSpanElement;

  constructor({ initialValue, title }: Props)
  {
    super("div");

    this.value = initialValue;

    const score = this.domElement;
    score.classList.add("score");

    const titleElement = document.createElement("span");
    titleElement.classList.add("score__text");
    titleElement.innerText = title;

    const valueElement = document.createElement("span");
    valueElement.classList.add("score__value");
    valueElement.innerText = this.value.toString();

    score.appendChild(titleElement);
    score.appendChild(valueElement);

    this.valueElement = valueElement;
  }

  protected setValue(value: number)
  {
    this.value = value;
    this.valueElement.innerText = value.toString();
  }
}