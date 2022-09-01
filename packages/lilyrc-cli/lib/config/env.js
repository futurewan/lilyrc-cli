'use strict';

const fs = require('fs');
const path = require('path');
let dotenv = require('dotenv');
let dotenvExpand = require('dotenv-expand');
const argv = require('yargs').argv;

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const NODE_ENV = process.env.NODE_ENV;
const envPath = resolveApp('./env/.env');
const dotenvFiles = [
  NODE_ENV === 'development' && `${envPath}.local`,
  `${envPath}.${argv.env || 'development'}`,
  envPath,
].filter(Boolean);

dotenvFiles.forEach(dotenvFile => {
  if (fs.existsSync(dotenvFile)) {
    const myEnv = dotenv.config({
      path: dotenvFile,
    });
    dotenvExpand.expand(myEnv);
  }
});
function clientEnvironment() {
  const LILY_APP = /^LILY_APP_/i;
  const raw = Object.keys(process.env)
    .filter(key => LILY_APP.test(key))
    .reduce(
      (env, key) => {
        env[key] = process.env[key];
        return env;
      },
      {
        NODE_ENV: process.env.NODE_ENV || 'development',
      }
    );

  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {}),
  };
  return stringified;
}

module.exports = clientEnvironment;
