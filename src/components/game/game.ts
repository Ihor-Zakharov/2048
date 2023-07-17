import * as BL from "@bl";
import { ActionsBottom } from "@components/actions/actionsBottom";
import { ActionsTop } from "@components/actions/actionsTop";
import { Control } from "@components/control/control";
import { Footer } from "@components/footer/footer";
import { Header } from "@components/header/header";
import { MessageConfirm } from "@components/messageConfirm/messageConfirm";
import { Pane } from "@components/pane/pane";
import { FnModalActivator, Portal } from "@components/portal/portal";
import { t } from "@i18n";
import { config } from "config";

export class Game extends Control<"body">
{
  private readonly actionsBottom: ActionsBottom;
  private readonly actionsTop: ActionsTop;
  private readonly fnMessageConfirmVisible: FnModalActivator<boolean>;
  private readonly main: HTMLElement;
  private readonly state: BL.State;

  private messageConfirmShown: boolean;
  private pane: Pane;

  constructor()
  {
    super("body");

    const selfElement = this.domElement;

    this.messageConfirmShown = false;
    this.state = new BL.State();
    this.handleThemeChangeQuery(this.state.theme);

    const size = this.state.size;

    // #region Portal

    const portal = new Portal();
    this.fnMessageConfirmVisible = portal.appendModal(new MessageConfirm({ title: t("messageConfirmTitle") }));

    // #endregion

    // #region Header

    const header = new Header();
    header.parent = this;

    // #endregion 

    // #region Main

    this.main = document.createElement("main");
    selfElement.appendChild(this.main);

    this.actionsTop = new ActionsTop({
      theme: this.state.theme,
      size: size,
      initialBestScore: this.state.bestScore,
      initialScore: this.state.score,
      onThemeChange: (value, onConfirmed) => this.handleThemeChangeQuery(value, onConfirmed),
      onSizeChange: (value, onConfirmed) => this.handleRestartQuery(value, onConfirmed)
    });
    this.actionsTop.setParent(this.main);

    this.pane = this.createPane(size);

    this.actionsBottom = new ActionsBottom({ onRestart: () => this.handleRestartQuery(), title: t("newGame") });
    this.actionsBottom.setParent(this.main);

    // #endregion

    // #region Footer

    const footerElement = new Footer();
    footerElement.parent = this;

    // #endregion

    document.addEventListener("keyup", event =>
    {
      event.preventDefault();
      this.handleKeyUp(event.key);
    });
  }

  private createPane(size: number): Pane
  {
    const pane = new Pane({
      onRestart: () => this.restart(),
      title: t("restart"),
      onCombined: value =>
      {
        this.actionsTop.incrementScore(value);
      },
      onMove: (values, scoreIncrement) =>
      {
        this.state.update(values, scoreIncrement);
      },
      size,
      values: this.state.matrix
    });

    pane.setParent(this.main);

    let touchFrom: Touch | undefined = undefined;

    pane.paneElement.addEventListener("touchstart", event =>
    {
      event.preventDefault();
      touchFrom = event.touches[0];
    });

    pane.paneElement.addEventListener("touchend", event =>
    {
      if (touchFrom !== undefined)
      {
        const touchTo = event.changedTouches[0];
        const deltaX = touchTo.clientX - touchFrom.clientX;
        const deltaY = touchTo.clientY - touchFrom.clientY;
        this.handlePossibleSwipe(deltaX, deltaY, BL.MovementDirection.Right, BL.MovementDirection.Left);
        this.handlePossibleSwipe(deltaY, deltaX, BL.MovementDirection.Down, BL.MovementDirection.Up);
        touchFrom = undefined;
      }
    });

    return pane;
  }

  private handleKeyUp(key: string): void
  {
    if (!this.messageConfirmShown)
    {
      switch (key)
      {
        case "ArrowUp": {
          this.pane.move(BL.MovementDirection.Up);
          break;
        }
        case "ArrowDown": {
          this.pane.move(BL.MovementDirection.Down);
          break;
        }
        case "ArrowRight": {
          this.pane.move(BL.MovementDirection.Right);
          break;
        }
        case "ArrowLeft": {
          this.pane.move(BL.MovementDirection.Left);
          break;
        }
      }
    }
  }

  private handlePossibleSwipe(delta1: number, delta2: number, movement1: BL.MovementDirection, movement2: BL.MovementDirection)
  {
    if (Math.abs(delta1) > config.swipeDistance && Math.abs(delta2) < config.swipeDistance)
    {
      this.pane.move(delta1 > 0 ? movement1 : movement2);
    }
  }

  private handleRestartQuery(size?: number, onConfirmed?: () => void)
  {
    const restart = (): void =>
    {
      onConfirmed?.();
      this.restart(size);
    };

    if (this.state.matrix === undefined || this.pane.gameOver)
    {
      restart();
    }
    else
    {
      this.messageConfirmShown = true;
      this.fnMessageConfirmVisible(result =>
      {
        this.messageConfirmShown = false;
        if (result)
        {
          restart();
        }
      });
    }
  }

  private handleThemeChangeQuery(theme: BL.ThemeValue, onConfirmed?: () => void)
  {
    onConfirmed?.();
    this.state.theme = theme;
    this.setDataAttribute("theme", theme);
  }

  private restart(size?: number): void
  {
    size ??= this.state.size;

    const sizeChanged = this.state.size !== size;

    this.state.reset(size);

    this.actionsTop.resetScore();

    if (sizeChanged)
    {
      this.pane.detach();
      this.pane = this.createPane(size);
      this.actionsTop.setBestScore(this.state.bestScore);
    }
    else
    {
      this.pane.restart();
    }
  }
}
