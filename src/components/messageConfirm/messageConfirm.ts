import { Control } from "@components/control/control";
import type { IModal, OnModalClose } from "@components/portal/portal";
import { t } from "@i18n";
import "./messageConfirm.scss";

interface Props
{
  title: string;
}
export class MessageConfirm extends Control<"div"> implements IModal<boolean>
{
  private onClose?: OnModalClose<boolean>;

  constructor({ title }: Props)
  {
    super("div");

    const selfElement = this.domElement;
    selfElement.classList.add("messageConfirm");
    this.setDataAttribute("hidden", "");

    const messageElement = document.createElement("div");
    messageElement.classList.add("messageConfirm__title");
    messageElement.innerText = title;
    selfElement.appendChild(messageElement);

    const actionsElement = document.createElement("div");
    actionsElement.classList.add("messageConfirm__actions");
    selfElement.appendChild(actionsElement);

    const buttonYesElement = document.createElement("button");
    buttonYesElement.classList.add("messageConfirm__buttonYes");
    buttonYesElement.innerText = t("messageConfirmYes");
    buttonYesElement.addEventListener("click", () => this.doClose(true));
    actionsElement.appendChild(buttonYesElement);

    const buttonNoElement = document.createElement("button");
    buttonNoElement.classList.add("messageConfirm__buttonNo");
    buttonNoElement.innerText = t("messageConfirmNo");
    buttonNoElement.addEventListener("click", () => this.doClose(false));
    actionsElement.appendChild(buttonNoElement);

    document.addEventListener("keyup", event => this.doClose(event.key === "Enter" ? true : event.key === "Escape" ? false : undefined));
  }

  public appendToContainer(container: HTMLDivElement): HTMLElement
  {
    return this.setParent(container);
  }

  public shown(onClose: OnModalClose<boolean>): void
  {
    this.onClose = onClose;
  }

  private doClose(result: boolean | undefined): void
  {
    if (result !== undefined && this.onClose !== undefined)
    {
      this.onClose(result);
      delete this.onClose;
    }
  }
}