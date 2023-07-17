import * as Webpack from "webpack";

export class ClearConsolePlugin
{
  private runCount: number;

  constructor()
  {
    this.runCount = 0;
  }

  public apply(compiler: Webpack.Compiler): void
  {
    compiler.hooks.beforeCompile.tap("ClearConsolePlugin", () =>
    {
      if (++this.runCount > 2)
      {
        process.stdout.write("\x1B[2J\x1B[3J\x1B[H");
      }
    });
  }
}