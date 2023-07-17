import * as BL from "@bl";
import { Control } from "@components/control/control";
import { OnPopupMenuValueChange, PopupMenu } from "@components/popupMenu/popupMenu";
import "./buttonSettings.scss";

export interface ButtonSettingsProps
{
  onSizeChange: OnPopupMenuValueChange<number>;
  onThemeChange: OnPopupMenuValueChange<BL.ThemeValue>;
  theme: BL.ThemeValue;
  size: number;
}

export class ButtonSettings extends Control<"button">
{
  private popupMenu: PopupMenu;

  constructor(props: ButtonSettingsProps)
  {
    super("button");

    const selfElement = this.domElement;
    selfElement.setAttribute("type", "button");
    selfElement.classList.add("buttonSettings");

    const spanElement = document.createElement("span");
    spanElement.innerText = "⚙";
    selfElement.appendChild(spanElement);

    this.popupMenu = new PopupMenu({ ...props, onVisibleChange: visible => selfElement.classList.toggle("buttonSettings--menuVisible", visible), triggerElement: selfElement });
    this.popupMenu.parent = this;
  }
}
