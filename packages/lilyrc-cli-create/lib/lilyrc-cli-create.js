'use strict';
const { Command } = require('commander');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const downloadGit = require('download-git-repo');
const ini = require('ini');
const decode = ini.decode;
const encode = ini.encode;
const symbol = require('log-symbols');

const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const os = require('os');
const spawn = require('cross-spawn');
const promisify = require('util').promisify;
const stat = promisify(fs.stat); // 同步方式
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const packageJson = require('../package.json');
const { RC, DEFAULTS } = require('./constant');

/**
 *
 * @param {string} path
 * @param {Boolean} capture 是否打印错误日志
 * @returns
 */
function fsStat(path, capture = true) {
  return new Promise(resolve => {
    try {
      stat(path)
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    } catch (err) {
      if (capture) {
        console.log(chalk.red('读取文件出错'), path);
      }
      resolve(false);
    }
  });
}

function WriteFileConfig(RC, opts) {
  return writeFile(RC, encode(opts), 'utf8').then(() => {
    // console.log('\n创建配置文件成功');
    Promise.resolve(true);
  });
}

function downloadLocal(projectName, branchName = 'template-cli') {
  return new Promise((resolve, reject) => {
    getConfig().then(config => {
      downloadGit(
        `direct:${config.registry}/${branchName}.zip`,
        projectName,
        err => {
          if (err) {
            console.log(symbol.error, chalk.red('download err'), err);
            reject(err);
          }
          resolve();
        }
      );
    });
  });
}
const createProject = projectName => {
  if (!fs.existsSync(projectName)) {
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
        const loading = ora('模板下载中...');
        loading.start();
        downloadLocal(projectName).then(
          () => {
            loading.succeed();
            const fileName = `${projectName}/package.json`;
            // 修改package.json 信息
            if (fs.existsSync(fileName)) {
              const data = fs.readFileSync(fileName).toString();
              const json = JSON.parse(data);
              json.name = projectName;
              json.author = author;
              json.description = description;
              fs.writeFileSync(
                fileName,
                JSON.stringify(json, null, '\t'),
                'utf-8'
              );
              console.log(symbol.success, chalk.green('项目初始化完成!'));
            }
          },
          err => {
            if (err) {
              console.log(symbol.error, chalk.green('项目初始化失败！'), err);
            }
            loading.fail();
          }
        );
      });
  } else {
    console.log('\n', symbol.error, chalk.red('项目名重复'));
  }
};

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
}
function install(root, dependencies) {
  return new Promise((resolve, reject) => {
    let command = 'npm';
    let args = ['install', '--no-audit', '--save', '--save-exact'].concat(
      dependencies
    );

    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', code => {
      console.log('code', code);
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
    console.log('process.execPath', process.execPath, JSON.stringify(data));
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
  console.log('root', root, fs.existsSync(projectName));
  // if (fs.existsSync(projectName)) {
  //   console.log('\n', symbol.error, chalk.red('项目名重复'));
  //   process.exit(1);
  // }
  // fse.ensureDirSync(projectName);

  // const packageJson = {
  //   name: projectName,
  //   version: '0.1.0',
  //   private: true,
  // };
  // fse.writeFileSync(
  //   path.join(root, 'package.json'),
  //   JSON.stringify(packageJson, null, 2) + os.EOL
  // );

  const allDependencies = ['react', 'react-dom', 'lilyrc-cli', templateName];

  const originalDirectory = process.cwd();
  console.log('originalDirectory', originalDirectory);
  process.chdir(root);
  const init = require('lilyrc-cli/lib/scripts/init.js');
  init(root, projectName, originalDirectory, templateName);
  // install(root, allDependencies).then(() => {
  // executeNodeScript(
  //   {
  //     cwd: process.cwd(),
  //   },
  //   [root, projectName, originalDirectory, templateName],
  //   `
  //   const init = require('lilyrc-cli/lib/scripts/init.js');
  //   init.apply(null, JSON.parse(process.argv[1]));
  //     `
  // );
  // });
}
module.exports = init;
