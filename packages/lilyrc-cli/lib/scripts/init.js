'use strict';
const path = require('path');
const os = require('os');
const fse = require('fs-extra');
const spawn = require('cross-spawn');
const chalk = require('react-dev-utils/chalk');
const execSync = require('child_process').execSync;

function tryGitInit() {
  try {
    execSync('git init', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.warn('Git repo not initialized', error);
    return false;
  }
}

module.exports = function (appPath, appName, originalDirectory, templateName) {
  const appPackage = require(path.join(appPath, 'package.json'));

  const templatePath = path.dirname(
    require.resolve(`${templateName}/package.json`, { paths: [appPath] })
  );
  const templateJsonPath = path.join(templatePath, 'template.json');
  let templateJson = {};
  if (fse.existsSync(templateJsonPath)) {
    templateJson = require(templateJsonPath);
  }
  const templatePackage = templateJson || {};
  const templatePackageToMerge = ['dependencies', 'scripts'];
  const templatePackageToReplace = Object.keys(templatePackage).filter(
    key => !templatePackageToMerge.includes(key)
  );
  appPackage.dependencies = Object.assign(
    {},
    appPackage.dependencies,
    templatePackage.dependencies
  );

  // 合并 package.json
  templatePackageToReplace.forEach(key => {
    appPackage[key] = templatePackage[key];
  });
  fse.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2) + os.EOL
  );

  // 拷贝基础工程
  const templateDir = path.join(templatePath, 'template');
  if (fse.existsSync(templateDir)) {
    fse.copySync(templateDir, appPath);
  } else {
    console.error(`未找到template目录: ${chalk.green(templateDir)}`);
    return;
  }

  const gitignoreExists = fse.existsSync(path.join(appPath, '.gitignore'));
  if (gitignoreExists) {
    // Append if there's already a `.gitignore` file there
    const data = fse.readFileSync(path.join(appPath, 'gitignore'));
    fse.appendFileSync(path.join(appPath, '.gitignore'), data);
    fse.unlinkSync(path.join(appPath, 'gitignore'));
  } else {
    fse.moveSync(
      path.join(appPath, 'gitignore'),
      path.join(appPath, '.gitignore'),
      []
    );
  }

  // 初始化git
  if (tryGitInit()) {
    console.log();
    console.log('初始化git仓库。');
  }

  let command = 'npm';
  let remove = 'uninstall';
  let args = ['install', '--no-audit', '--save'];
  // 安装模板中的dependencies
  const dependenciesToInstall = Object.entries({
    ...templatePackage.dependencies,
    ...templatePackage.devDependencies,
  });
  if (dependenciesToInstall.length) {
    args = args.concat(
      dependenciesToInstall.map(([dependency, version]) => {
        return `${dependency}@${version}`;
      })
    );
  }
  if (templateName && args.length > 1) {
    console.log();
    console.log(`正在安装依赖中...`);

    const proc = spawn.sync(command, args, { stdio: 'inherit' });
    if (proc.status !== 0) {
      console.error(`\`${command} ${args.join(' ')}\` failed`);
      return;
    }
  }
  // 移除 template
  console.log(`删除模板包...`);
  console.log();

  const proc = spawn.sync(command, [remove, templateName], {
    stdio: 'inherit',
  });
  if (proc.status !== 0) {
    console.error(`\`${command}\` failed`);
    return;
  }

  console.log();
  console.log(`Success! Created ${appName} at ${appPath}`);
  console.log('Inside that directory, you can run several commands:');
  console.log();
  console.log(chalk.cyan(`npm start`));
  console.log('    Starts the development server.');
  console.log();
  console.log(chalk.cyan(`npm run build`));
  console.log('    Bundles the app into static files for production.');
};
