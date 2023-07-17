import MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as Webpack from "webpack";
import { configurationBuilder as commonConfigurationBuilder } from "./webpack.common";

const configurationBuilder = (): Webpack.Configuration =>
{
  const configuration = commonConfigurationBuilder({ cssEmitter: MiniCssExtractPlugin.loader, mode: "production" });

  const plugins = configuration.plugins ?? [];

  plugins.push(new MiniCssExtractPlugin({
    filename: "[name][contenthash].css",
  }));

  configuration.plugins = plugins;

  return {
    ...configuration,
    plugins
  };
};

export default configurationBuilder;
