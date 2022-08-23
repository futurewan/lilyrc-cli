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

function getConfig() {
  return new Promise(resolve => {
    fsStat(RC, false).then(statRes => {
      if (statRes) {
        readFile(RC, 'utf8').then(optsRes => {
          resolve(decode(optsRes));
        });
      } else {
        resolve({});
      }
    });
  });
}

function WriteFileConfig(RC, opts) {
  return writeFile(RC, encode(opts), 'utf8').then(() => {
    // console.log('\n创建配置文件成功');
    Promise.resolve(true);
  });
}
// registry
function setConfig(key, value) {
  return fsStat(RC, false).then(rcOption => {
    let opts = {};
    if (rcOption) {
      readFile(RC, 'utf8').then(optsRes => {
        opts = decode(optsRes);
        if (!key) {
          console.log(
            chalk.red(chalk.bold('Error:')),
            chalk.red('key is required')
          );
          return;
        }
        if (!value) {
          console.log(
            chalk.red(chalk.bold('Error:')),
            chalk.red('value is required')
          );
          return;
        }
        Object.assign(opts, { [key]: value });
        WriteFileConfig(RC, opts).then(writeRes => {
          Promise.resolve(writeRes);
        });
      });
    } else {
      Object.assign(opts, DEFAULTS, key && value ? { [key]: value } : {});
      WriteFileConfig(RC, opts).then(writeRes => {
        Promise.resolve(writeRes);
      });
    }
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

function createApp(projectName) {
  getConfig().then(config => {
    // 未配置仓库地址
    if (!config.registry) {
      inquirer
        .prompt([
          {
            name: 'isCreate',
            message: '您还没有配置仓库信息，是否使用默认配置',
            type: 'confirm',
          },
        ])
        .then(answer => {
          const { isCreate } = answer;
          // 使用默认配置
          if (isCreate) {
            setConfig().then(() => {
              createProject(projectName);
            });
          } else {
            inquirer
              .prompt([
                {
                  name: 'registry',
                  message: '请输入仓库名称',
                },
              ])
              .then(config => {
                const { registry } = config;
                if (registry) {
                  setConfig('registry', registry).then(() => {
                    createProject(projectName);
                  });
                } else {
                  console.log('退出创建配置文件');
                }
              });
          }
        })
        .catch(err => {
          console.log('读取配置文件出错', err);
        });
      return false;
    } else {
      createProject(projectName);
    }
  });
}
module.exports = init;
