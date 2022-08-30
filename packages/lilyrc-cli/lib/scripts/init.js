'use strict';
const path = require('path');
const os = require('os');
const fse = require('fs-extra');
const chalk = require('react-dev-utils/chalk');

module.exports = function (appPath, appName, originalDirectory, templateName) {
  const appPackage = require(path.join(appPath, 'package.json'));

  console.log('appPackage', templateName, appPackage);
  const templatePath = path.dirname(
    require.resolve(`${templateName}/package.json`, { paths: [appPath] })
  );
  const templateJsonPath = path.join(templatePath, 'template.json');
  let templateJson = {};
  if (fse.existsSync(templateJsonPath)) {
    templateJson = require(templateJsonPath);
  }
  const templatePackage = templateJson || {};
  const templatePackageToReplace = Object.keys(templatePackage);

  // merge package.json
  templatePackageToReplace.forEach(key => {
    appPackage[key] = templatePackage[key];
  });
  fse.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2) + os.EOL
  );
  console.log('appPath', appPath, appPackage);

  // 拷贝基础工程
  const templateDir = path.join(templatePath, 'template');
  if (fse.existsSync(templateDir)) {
    fse.copySync(templateDir, appPath);
  } else {
    console.error(`未找到template目录: ${chalk.green(templateDir)}`);
    return;
  }

  const gitignoreExists = fse.existsSync(path.join(appPath, '.gitignore'));
  console.log('gitignoreExists', gitignoreExists);
  if (gitignoreExists) {
    // Append if there's already a `.gitignore` file there
    const data = fse.readFileSync(path.join(appPath, 'gitignore'));
    fse.appendFileSync(path.join(appPath, '.gitignore'), data);
    fse.unlinkSync(path.join(appPath, 'gitignore'));
  } else {
    // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
    // See: https://github.com/npm/npm/issues/1862
    fse.moveSync(
      path.join(appPath, 'gitignore'),
      path.join(appPath, '.gitignore'),
      []
    );
  }
};
