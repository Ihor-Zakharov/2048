import * as BL from "@bl";
import { ButtonSettingsProps } from "@components/buttonSettings/buttonSettings";
import { Control } from "@components/control/control";
import { t } from "@i18n";
import "./popupMenu.scss";

export type OnPopupMenuValueChange<TValue> = (value: TValue, onApplied: () => void) => void;

interface IState<TValue>
{
  element: HTMLLIElement | null;
  value: TValue;
}

interface ActiveState
{
  isInside: boolean;
}

interface IItem<TValue>
{
  title: string;
  value: TValue;
}

interface Props extends ButtonSettingsProps
{
  onVisibleChange: (visible: boolean) => void;
  triggerElement: HTMLElement;
}

export class PopupMenu extends Control<"ul">
{
  private static readonly sizeItems: IItem<number>[] = BL.Matrix.availableSizes.map(value => ({ title: `${value} × ${value}`, value }));
  private static readonly themeItems: IItem<BL.ThemeValue>[] = [{ title: t("themeDefault"), value: null }, { title: t("themeLight"), value: "light" }, { title: t("themeDark"), value: "dark" }];

  private readonly onVisibleChange: Props["onVisibleChange"];

  private activeState: ActiveState | undefined;

  constructor({ onSizeChange, onThemeChange, onVisibleChange, size, theme, triggerElement }: Props)
  {
    super("ul");

    this.onVisibleChange = onVisibleChange;

    const selfElement = this.domElement;

    selfElement.classList.add("popupMenu");
    selfElement.setAttribute("data-hidden", "true");

    selfElement.appendChild(this.createSection(t("gameboard"), size, PopupMenu.sizeItems, onSizeChange));
    selfElement.appendChild(this.createSection(t("theme"), theme, PopupMenu.themeItems, onThemeChange));

    triggerElement.addEventListener("click", () => this.visible = this.activeState === undefined);
  }

  private set visible(value: boolean)
  {
    if ((this.activeState !== undefined) !== value)
    {
      const selfElement = this.domElement;

      const close = () => 
      {
        this.activeState = undefined;
        selfElement.removeEventListener("mouseenter", handleMouseEnter);
        selfElement.removeEventListener("mouseleave", handleMouseLeave);
        selfElement.dataset.hidden = "true";
        this.onVisibleChange(false);
      };

      const handleMouseEnter = () =>
      {
        if (this.activeState !== undefined)
        {
          this.activeState.isInside = true;
        }
      };

      const handleMouseLeave = () =>
      {
        if (this.activeState !== undefined)
        {
          close();
        }
      };

      const open = () =>
      {
        this.activeState = {
          isInside: false
        };

        selfElement.addEventListener("mouseenter", handleMouseEnter);
        selfElement.addEventListener("mouseleave", handleMouseLeave);
        delete selfElement.dataset.hidden;
        this.onVisibleChange(true);
      };

      if (value)
      {
        open();
      }
      else
      {
        close();
      }
    }
  }

  private createSection<TValue>(title: string, initialValue: TValue, items: IItem<TValue>[], onValueChange: OnPopupMenuValueChange<TValue>)
  {
    let state: IState<TValue> = {
      value: initialValue,
      element: null
    };

    const sectionElement = document.createElement("li");

    const titleElement = document.createElement("div");
    titleElement.innerText = title;
    sectionElement.appendChild(titleElement);

    const menuElement = document.createElement("ul");

    items.forEach(item =>
    {
      const itemElement = document.createElement("li");
      itemElement.innerText = item.title;

      if (item.value === state.value)
      {
        state.element = itemElement;
        itemElement.dataset.selected = "";
      }

      itemElement.addEventListener("click", event =>
      {
        event.stopPropagation();

        const value = item.value;
        if (state.value !== value)
        {
          this.visible = false;
          onValueChange(value, () =>
          {
            delete state.element?.dataset.selected;
            itemElement.dataset.selected = "";
            state = { value, element: itemElement };
          });
        }
      });

      menuElement.append(itemElement);
    });

    sectionElement.appendChild(menuElement);

    return sectionElement;
  }
}
