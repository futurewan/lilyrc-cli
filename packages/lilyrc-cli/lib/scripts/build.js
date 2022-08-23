'use strict';
process.env.NODE_ENV = 'production';
console.log('webpack build');

const webpack = require('webpack');
const chalk = require('react-dev-utils/chalk');
const configFactory = require('../config/webpack.config');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const getRunConfig = require('../utils/getRunConfig');

getRunConfig()
  .then(runConfig => {
    return build(runConfig);
  })
  .then(({ warnings }) => {
    if (warnings.length) {
      console.log(chalk.yellow('Compiled with warnings.\n'));
      console.log(warnings.join('\n\n'));
      console.log(
        '\nSearch for the ' +
          chalk.underline(chalk.yellow('keywords')) +
          ' to learn more about each warning.'
      );
      console.log(
        'To ignore, add ' +
          chalk.cyan('// eslint-disable-next-line') +
          ' to the line before.\n'
      );
    } else {
      console.log(chalk.green('Compiled successfully.\n'));
    }
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });

function build(runConfig) {
  const config = configFactory('production', runConfig);
  console.log('Creating an optimized production build...');
  const compiler = webpack(config);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      let messages;
      if (err) {
        console.log(err, stats);
      } else {
        messages = formatWebpackMessages(
          stats.toJson({ all: false, warnings: true, errors: true })
        );
      }
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        return reject(new Error(messages.errors.join('\n\n')));
      }
      const resolveArgs = {
        stats,
        warnings: messages.warnings,
      };

      resolve(resolveArgs);
    });
  });
}
