import { Control } from "@components/control/control";
import * as i18n from "@i18n";
import { ConfigKey, config } from "config";
import "./footer.scss";

export class Footer extends Control<"footer">
{
  constructor()
  {
    super("footer");

    const selfElement = this.domElement;
    selfElement.classList.add("footer");

    const linesElement = document.createElement("div");
    linesElement.classList.add("footer__lines");

    linesElement.appendChild(Footer.interpolate(i18n.t("footer.firstLine")));
    linesElement.appendChild(Footer.interpolate(i18n.t("footer.secondLine")));
    linesElement.appendChild(Footer.interpolate(i18n.t("footer.thirdLine")));
    linesElement.appendChild(Footer.interpolate(i18n.t("footer.forthLine")));

    selfElement.appendChild(linesElement);
  }

  public static interpolate(text: string): HTMLDivElement
  {
    const resultElement = document.createElement("div");
    resultElement.classList.add("footer__line");

    for (const item of i18n.interpolate(text))
    {
      let element;

      if (typeof item === "string") 
      {
        element = document.createElement("span");
        element.innerText = item;
      }
      else 
      {
        switch (item.type)
        {
          case "link": {
            element = document.createElement("a");
            element.href = config[item.href as ConfigKey].toString();
            element.innerText = item.text;
            break;
          }
        }
      }

      resultElement.appendChild(element);
    }

    return resultElement;
  }
}