
const verbiage = {
  bestScore: "Best",
  gameboard: "Gameboard",
  gameOver: "Game over",
  messageConfirmNo: "No",
  messageConfirmTitle: "Are you sure you want to restart?",
  messageConfirmYes: "Yes",
  newGame: "New Game",
  restart: "Restart",
  score: "Score",
  theme: "Theme",
  themeDark: "Dark",
  themeDefault: "Default",
  themeLight: "Light",
  footer: {
    firstLine: "This game is based on Gabriele Cirulli's {\"type\": \"link\", \"href\": \"originalGameUrl\", \"text\": \"original game\"}.",
    secondLine: "Portions of dark theme styling are taken from {\"type\": \"link\", \"href\": \"darkGameUrl\", \"text\": \"2048 dark\"}.",
    thirdLine: "Source code can be found in my GitHub {\"type\": \"link\", \"href\": \"repoUrl\", \"text\": \"repository\"}.",
    forthLine: "© 2023"
  },
} as const;

type Join<K, P> =
  K extends string ?
  P extends string ?
  `${K}${"" extends P ? "" : "."}${P}`
  :
  never
  :
  never;

/*
type Paths<T> =
  T extends object ?
  {
    [K in keyof T]-?: K extends string ? `${K}` | Join<K, Paths<T[K]>> : never
  }[keyof T]
  :
  never;
*/

type Leaves<T> =
  T extends object ?
  {
    [K in keyof T]-?: Join<K, Leaves<T[K]>>
  }[keyof T]
  :
  "";

type Verbiage = typeof verbiage;

type TFunc<V> = (key: Leaves<V>) => string;
type TNamespaceFunc<V, N extends keyof V> = (namespace: N) => TFunc<V[N]>;

const tx = (verbiage: any, key: string): string =>
{
  const keys = key.split(".");

  for (const k of keys)
  {
    verbiage = verbiage[k];
    if (verbiage === undefined)
    {
      break;
    }
  }
  if (typeof verbiage !== "string")
  {
    throw new Error("Invalid key specified");
  }

  return verbiage;
};

export const t: TFunc<Verbiage> = key => tx(verbiage, key);
export const tn: TNamespaceFunc<Verbiage, keyof Verbiage> = namespace => key => tx(verbiage[namespace], key);

type IInterpolationPlaceholder = {
  type: "link",
  href: string,
  text: string
}

export function* interpolate(text: string): Generator<string | IInterpolationPlaceholder>
{
  const length = text.length;
  let index = 0;

  do
  {
    const beginIndex = text.indexOf("{", index);
    if (beginIndex < 0) 
    {
      yield index === 0 ? text : text.substring(index);
      return;
    }

    const endIndex = text.indexOf("}", beginIndex + 1);
    if (endIndex < 0)
    {
      throw new Error("Closing brace '}' not found");
    }

    if (beginIndex > index)
    {
      yield text.substring(index, beginIndex);
    }

    yield JSON.parse(text.substring(beginIndex, index = endIndex + 1));
  }
  while (index < length);
}