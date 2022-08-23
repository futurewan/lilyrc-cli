'use strict';
process.env.NODE_ENV = 'development';
process.on('unhandledRejection', err => {
  throw err;
});
const webpack = require('webpack');
const fs = require('fs');
const WebpackDevServer = require('webpack-dev-server');
const chalk = require('react-dev-utils/chalk');
const {
  choosePort,
  createCompiler,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const paths = require('../config/paths');
const openBrowser = require('react-dev-utils/openBrowser');
const getRunConfig = require('../utils/getRunConfig');

const configFactory = require('../config/webpack.config');
const HOST = process.env.HOST || '0.0.0.0';

getRunConfig()
  .then(runConfig => {
    const DEFAULT_PORT = runConfig.port || 8001;
    if (runConfig.port) {
      console.log(
        chalk.cyan(
          `Attempting to bind to HOST environment variable: ${chalk.yellow(
            chalk.bold(runConfig.port)
          )}`
        )
      );
    }
    choosePort(HOST, DEFAULT_PORT).then(port => {
      if (port == null) {
        // We have not found a port.
        return;
      }

      const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
      const appName = require(paths.appPackageJson).name;
      const config = configFactory('development');
      const useTypeScript = fs.existsSync(paths.appTsConfig);
      const urls = prepareUrls(
        protocol,
        HOST,
        port
        // paths.publicUrlOrPath.slice(0, -1)
      );
      const compiler = createCompiler({
        appName,
        config,
        webpack,
        urls,
        useTypeScript,
      });
      const serverConfig = {
        // ...createDevServerConfig(proxyConfig, urls.lanUrlForConfig),
        host: HOST,
        port,
        historyApiFallback: true,
      };
      const devServer = new WebpackDevServer(serverConfig, compiler);
      devServer.startCallback(() => {
        console.log(chalk.cyan('Starting the development server...\n'));
        openBrowser(urls.localUrlForBrowser);
      });
      ['SIGINT', 'SIGTERM'].forEach(function (sig) {
        process.on(sig, function () {
          devServer.close();
          process.exit();
        });
      });
      if (process.env.CI !== 'true') {
        // Gracefully exit when stdin ends
        process.stdin.on('end', function () {
          devServer.close();
          process.exit();
        });
      }
    });
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
