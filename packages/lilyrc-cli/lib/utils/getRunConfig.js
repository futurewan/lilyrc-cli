'use strict';

const path = require('path');
const chalk = require('chalk');
const argv = require('yargs').argv;
const fse = require('fs-extra');

function getRunConfig() {
  return new Promise((resolve, reject) => {
    // default config path
    const lilyRcPath = path.resolve(process.cwd(), 'lilyrc.config.js');
    if (argv.config) {
      const configPath = path.resolve(process.cwd(), argv.config);
      fse
        .stat(configPath)
        .then(
          stat => {
            const isFile = stat.isFile();
            if (isFile) {
              return configPath;
            } else {
              reject('配置文件不存在，请正确配置路径');
              process.exit(1);
            }
          },
          () => {
            console.log(chalk.red('配置路径不存在'), configPath);
          }
        )
        .then(path => {
          if (!path) return;
          resolve(require(path));
        })
        .catch(err => reject(err));
    } else if (fse.existsSync(lilyRcPath)) {
      resolve(require(lilyRcPath));
    } else {
      resolve({});
    }
  });
}
module.exports = getRunConfig;
