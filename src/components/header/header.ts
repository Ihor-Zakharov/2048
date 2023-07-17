import { Control } from "@components/control/control";

export class Header extends Control<"header">
{
  constructor()
  {
    super("header");

    const selfElement = this.domElement;

    const titleElement = document.createElement("h1");
    titleElement.innerText = "2048";
    selfElement.appendChild(titleElement);
  }
}