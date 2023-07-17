import * as Webpack from "webpack";
import "webpack-dev-server";
import { ClearConsolePlugin } from "./webpack.clearConsolePlugin";

import { configurationBuilder as commonConfigurationBuilder } from "./webpack.common";

const configurationBuilder = (): Webpack.Configuration =>
{
  const configuration = commonConfigurationBuilder({ cssEmitter: "style-loader", mode: "development" });

  const plugins = configuration.plugins ?? [];

  plugins.push(new ClearConsolePlugin());

  return {
    ...configuration,
    devServer: {
      static: {
        directory: configuration.output?.path,
      },
      port: 3000,
      open: true,
      hot: true,
      compress: true,
      historyApiFallback: true,
    },
    plugins
  };
};

export default configurationBuilder;
