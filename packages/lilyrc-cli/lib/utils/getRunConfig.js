'use strict';

const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const fse = require('fs-extra');

function getRunConfig() {
  return new Promise((resolve, reject) => {
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
              reject('配置文件不存在');
              process.exit(1);
            }
          },
          err => {
            console.log('配置路径不存在', err);
          }
        )
        .then(path => {
          resolve(require(path));
        });
    } else {
      resolve({});
    }
  });
}
module.exports = getRunConfig;
