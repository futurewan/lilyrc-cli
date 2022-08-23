'use strict';
const path = require('path');
const fs = require('fs');
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  rootDir: appDirectory,
  appPath: resolveApp('.'),
  appPackageJson: resolveApp('package.json'),
  appTsConfig: resolveApp('tsconfig.json'),
  appIndex: resolveApp('src/index'), //入口文件
  appSrc: resolveApp('src'), //项目代码主目录
  appDist: resolveApp('dist'), //打包目录
  appHtml: resolveApp('index.html'), //模板文件
  appRedux: resolveApp('src/redux'), //项目redux目录
  appPages: resolveApp('src/pages'),
  appStatic: resolveApp('src/static'),
  appUtil: resolveApp('src/util'),
  appInterfaces: resolveApp('src/interfaces'),
  apis: resolveApp('src/apis'),
  appNodeModules: resolveApp('node_modules'),
  appWebpackCache: resolveApp('node_modules/.cache'),
};
