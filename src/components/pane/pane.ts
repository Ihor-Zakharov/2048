import * as BL from "@bl";
import { Animation } from "@components/animation/animation";
import { ButtonStartProps } from "@components/buttonStart/buttonStart";
import { Control } from "@components/control/control";
import { ITileCoords, Tile } from "@components/tile/tile";
import { t } from "@i18n";
import "./pane.scss";

import { config } from "config";

interface IPanePixelData
{
  paneSize: number;
  dimention: number;
  margin: number;
}

interface Props extends ButtonStartProps
{
  onMove: (values: BL.ElementValues, scoreIncrement: number) => void;
  onCombined: (value: number) => void;
  size: number;
  values?: BL.ElementValues;
}

export class Pane extends Control<"div">
{
  private static readonly panePixelData: IPanePixelData[] =
    [
      {
        paneSize: 3,
        dimention: 149,
        margin: 16,
      },
      {
        paneSize: 4,
        dimention: 108,
        margin: 14
      },
      {
        paneSize: 5,
        dimention: 88,
        margin: 12
      }
    ];

  public readonly paneElement: HTMLDivElement;

  private readonly animation: Animation;
  private readonly matrix: BL.Matrix;
  private readonly onMove: Props["onMove"];
  private readonly tiles: Tile[];

  private furtherProceed: boolean;
  private pixelData: IPanePixelData;

  constructor({ onCombined, onMove, size, values }: Props)
  {
    super("div");

    let isPhone = window.innerWidth <= 540;

    const getPixelData = () =>
    {
      let newPixelData = Pane.panePixelData.find(obj => obj.paneSize === size);
      if (newPixelData === undefined)
      {
        throw new Error("Pixel Data is undefined");
      }

      if (isPhone)
      {
        const { dimention, margin } = newPixelData;
        const coefficient = config.phoneScaleFactorPixelData;

        newPixelData = { ...newPixelData, dimention: dimention * coefficient, margin: margin * coefficient };
      }

      return newPixelData;
    };

    const selfElement = this.domElement;
    selfElement.classList.add("pane__wrapper");
    selfElement.style.setProperty("--tile--width", "10%");

    this.paneElement = document.createElement("div");
    this.paneElement.classList.add("pane", `pane--${size}`);
    selfElement.appendChild(this.paneElement);

    const length = size * size;
    for (let i = 0; i < length; i++)
    {
      const cell = document.createElement("div");
      this.paneElement.append(cell);
    }

    const gameOverElement = document.createElement("div");
    gameOverElement.classList.add("pane__gameOver");
    gameOverElement.innerText = t("gameOver");
    selfElement.appendChild(gameOverElement);

    this.furtherProceed = true;
    this.onMove = onMove;
    this.pixelData = getPixelData();
    this.tiles = [];
    this.matrix = new BL.Matrix(size);
    this.animation = new Animation({
      onCombined,
      onEnd: () =>
      {
        if (this.gameOver)
        {
          this.setDataAttribute("gameOver", "");
        }
      },
      pane: this
    });

    const proceedResult = this.matrix.start(values);
    this.processProceedResult(proceedResult);

    window.addEventListener("resize", () =>
    {
      const prevDeviceType = isPhone;
      isPhone = window.innerWidth <= 540;

      if (prevDeviceType !== isPhone)
      {
        this.pixelData = getPixelData();
        this.tiles.forEach(tile => tile.setCoords(this.elementPositionToCoords(tile.element.position)));
      }
    });
  }

  public get gameOver(): boolean
  {
    return !this.furtherProceed;
  }

  public addTile(tile: Tile)
  {
    this.tiles.push(tile);
    tile.setParent(this.paneElement);
  }

  public override detach(): void
  {
    this.animation.cancel();
    super.detach();
  }

  public getTile(element: BL.IElement): Tile
  {
    const tile = this.tiles.find(e => e.element === element);
    if (tile === undefined)
    {
      throw new Error("Tile is undefined for given element");
    }
    return tile;
  }

  public move(direction: BL.MovementDirection): void
  {
    const proceedResult = this.matrix.proceed(direction);
    if (proceedResult !== null)
    {
      this.processProceedResult(proceedResult);
    }
  }

  public removeTile(tile: Tile)
  {
    const tileIndex = this.tiles.indexOf(tile);
    if (tileIndex >= 0)
    {
      this.tiles.splice(tileIndex, 1);
      tile.detach();
    }
  }

  public restart(): void
  {
    this.setDataAttribute("gameOver", undefined);
    this.clearTiles();
    const proceedResult = this.matrix.start();
    this.processProceedResult(proceedResult);
  }

  public elementPositionToCoords(position: BL.IElementPosition): ITileCoords
  {
    const { dimention, margin, paneSize } = this.pixelData;

    this.paneElement.style.setProperty("--dimention", dimention.toString() + "px");
    this.paneElement.style.setProperty("--indent", margin.toString() + "px");
    this.paneElement.style.setProperty("--font-size", (dimention / 10).toString() + "px");
    this.paneElement.style.setProperty("--pane-size", paneSize.toString());

    return {
      left: position.column * (dimention + margin) + margin,
      top: position.row * (dimention + margin) + margin
    };
  }

  private clearTiles()
  {
    this.tiles.forEach(tile => tile.detach());

    this.tiles.length = 0;
  }

  private processProceedResult(proceedResult: BL.IProceedResult)
  {
    const { events, furtherProceed, justStarted, scoreIncrement, values } = proceedResult;
    this.furtherProceed = furtherProceed;
    if (!justStarted)
    {
      this.onMove(values, scoreIncrement);
    }
    this.animation.perform(events);
  }
}
