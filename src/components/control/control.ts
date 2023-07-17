export abstract class Control<K extends keyof HTMLElementTagNameMap>
{
  protected readonly domElement: HTMLElementTagNameMap[K];

  constructor(tagName: K)
  {
    this.domElement = tagName === "body" ? document.body as HTMLElementTagNameMap[K] : document.createElement(tagName);
  }

  public set parent(value: Control<any>)
  {
    value.domElement.appendChild(this.domElement);
  }

  public detach(): void
  {
    const control = this.domElement;
    control.parentElement?.removeChild(control);
  }

  public setParent(parent: HTMLElement): HTMLElementTagNameMap[K]
  {
    parent.appendChild(this.domElement);
    return this.domElement;
  }

  protected setDataAttribute(name: string, value: string | null | undefined)
  {
    if (value === null || value === undefined)
    {
      delete this.domElement.dataset[name];
    }
    else
    {
      this.domElement.dataset[name] = value;
    }
  }
}
