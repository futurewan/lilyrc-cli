'use strict';
const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const symbol = require('log-symbols');

const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const os = require('os');
const spawn = require('cross-spawn');
const packageJson = require('../package.json');

// 初始化工程
function init() {
  const program = new Command(packageJson.name);
  program
    .arguments('<project-name>')
    .description('从模板项目初始化一个新项目')
    .usage('<project-name>')
    .action(name => {
      console.log('项目名：', chalk.greenBright(name));
      createApp(name);
    })
    .showHelpAfterError()
    .parse(process.argv);

  program.version(packageJson.version, '-v, --version');
}
function install(root, dependencies) {
  return new Promise((resolve, reject) => {
    let command = 'npm';
    let args = ['install', '--no-audit', '--save', '--save-exact'].concat(
      dependencies
    );

    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', code => {
      if (code !== 0) {
        reject({ command: `${command} ${args.join(' ')}` });
        return;
      }
      resolve();
    });
  });
}
function executeNodeScript({ cwd }, data, source) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ['-e', source, '--', JSON.stringify(data)],
      { cwd, stdio: 'inherit' }
    );
    child.on('close', code => {
      if (code !== 0) {
        reject({
          command: 'node',
        });
        return;
      }
      resolve();
    });
  });
}
function createApp(projectName, template) {
  const root = path.resolve(projectName);
  const templateName = template || 'lilyrc-cli-template';
  if (fs.existsSync(projectName)) {
    console.log('\n', symbol.error, chalk.red('项目名重复'));
    process.exit(1);
  }
  fse.ensureDirSync(projectName);

  inquirer
    .prompt([
      {
        name: 'description',
        type: 'input',
        message: '请输入项目的描述',
      },
      {
        name: 'author',
        message: '请输入作者名',
      },
    ])
    .then(answer => {
      const { description, author } = answer;
      const packageJson = {
        name: projectName,
        version: '0.1.0',
        private: true,
        description,
        author,
      };
      fse.writeFileSync(
        path.join(root, 'package.json'),
        JSON.stringify(packageJson, null, 2) + os.EOL
      );

      const allDependencies = [
        'react',
        'react-dom',
        'lilyrc-cli',
        templateName,
      ];

      const originalDirectory = process.cwd();
      process.chdir(root);
      // const init = require('lilyrc-cli/lib/scripts/init.js');
      // init(root, projectName, originalDirectory, templateName);
      console.log(
        `Installing ${chalk.cyan('react')}, ${chalk.cyan(
          'react-dom'
        )}, and ${chalk.cyan('lilyrc-cli')} with ${chalk.cyan(templateName)} 
        ...`
      );
      install(root, allDependencies).then(() => {
        executeNodeScript(
          {
            cwd: process.cwd(),
          },
          [root, projectName, originalDirectory, templateName],
          `
    const init = require('lilyrc-cli/lib/scripts/init.js');
    init.apply(null, JSON.parse(process.argv[1]));
      `
        );
      });
    });
}
module.exports = init;
