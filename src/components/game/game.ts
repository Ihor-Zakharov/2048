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
import * as Hammer from "hammerjs";

interface DirectionDescriptor
{
  direction: BL.MovementDirection;
  key: string;
  swipe: number;
}

export class Game extends Control<"body">
{
  private static readonly directionDescriptors: DirectionDescriptor[] = [
    {
      direction: BL.MovementDirection.Down,
      key: "ArrowDown",
      swipe: Hammer.DIRECTION_DOWN
    },
    {
      direction: BL.MovementDirection.Left,
      key: "ArrowLeft",
      swipe: Hammer.DIRECTION_LEFT
    },
    {
      direction: BL.MovementDirection.Right,
      key: "ArrowRight",
      swipe: Hammer.DIRECTION_RIGHT
    },
    {
      direction: BL.MovementDirection.Up,
      key: "ArrowUp",
      swipe: Hammer.DIRECTION_UP
    },
  ];

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
      this.handleMovement(d => d.key === event.key);
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

    const hammerManager = new Hammer.Manager(pane.paneElement);
    hammerManager.add(new Hammer.Swipe({ velocity: 0.2 }));
    hammerManager.on("swipe", e => this.handleMovement(d => d.swipe === e.direction));

    return pane;
  }

  private handleMovement(fnCondition: (directionDescriptor: DirectionDescriptor) => boolean): void
  {
    if (!this.messageConfirmShown)
    {
      const directionDescriptor = Game.directionDescriptors.find(fnCondition);
      if (directionDescriptor !== undefined)
      {
        this.pane.move(directionDescriptor.direction);
      }
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
