import ESLintPlugin from "eslint-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import Path from "path";
import TsConfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import * as Webpack from "webpack";

interface Props
{
  cssEmitter: string;
  mode: Webpack.Configuration["mode"];
}

export const configurationBuilder = ({ cssEmitter, mode }: Props): Webpack.Configuration =>
{
  return {
    devtool: mode === "production" ? "source-map" : "inline-source-map",
    entry: {
      main: Path.resolve(__dirname, "../src/main.ts")
    },
    mode,
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [cssEmitter, "css-loader", "sass-loader"],
        },
        {
          test: /\.ts$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    output: {
      clean: true,
      filename: "[name][contenthash].js",
      path: Path.resolve(__dirname, "../dist")
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: "2048",
        filename: "index.html",
        template: "./public/index.html",
        favicon: "./public/favicon.ico",
      }),
      new ESLintPlugin({
        cache: false,
        extensions: ["ts"]
      }),
    ],
    resolve: {
      extensions: [".ts", ".js"],
      plugins: [
        new TsConfigPathsPlugin({
          configFile: Path.resolve(__dirname, "../tsconfig.json")
        })
      ]
    },
    stats: "errors-warnings",
  };
};
