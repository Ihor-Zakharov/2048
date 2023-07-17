import "./portal.scss";

export type OnModalClose<TModalResult> = (result: TModalResult) => void

export interface IModal<TModalResult>
{
  appendToContainer(container: HTMLDivElement): HTMLElement;
  shown(onResult: OnModalClose<TModalResult>): void;
}

export type FnModalActivator<TModalResult> = (onClose: OnModalClose<TModalResult>) => void;

export class Portal
{
  private readonly maskElement: HTMLDivElement;
  private readonly modalContainerElement: HTMLDivElement;

  private modalCount: number;

  constructor()
  {
    this.maskElement = document.createElement("div");
    this.maskElement.classList.add("portal__mask");
    this.maskElement.dataset.hidden = "";
    document.body.appendChild(this.maskElement);

    this.modalContainerElement = document.createElement("div");
    this.modalContainerElement.classList.add("portal__modalContainer");
    this.modalContainerElement.dataset.hidden = "";
    document.body.appendChild(this.modalContainerElement);

    this.modalCount = 0;
  }

  public appendModal<TModalResult>(modal: IModal<TModalResult>): FnModalActivator<TModalResult>
  {
    const modalElement = modal.appendToContainer(this.modalContainerElement);

    return onClose =>
    {
      const firstModal = this.modalCount++ === 0;
      if (firstModal)
      {
        delete this.maskElement.dataset.hidden;
        delete this.modalContainerElement.dataset.hidden;
      }
      delete modalElement.dataset.hidden;
      modal.shown(modalResult =>
      {
        const onlyModal = --this.modalCount === 0;
        if (onlyModal)
        {
          this.maskElement.dataset.hidden = "";
          this.modalContainerElement.dataset.hidden = "";
        }
        modalElement.dataset.hidden = "";
        onClose(modalResult);
      });
    };
  }
}
