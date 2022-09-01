'use strict';

const { Command } = require('commander');
const spawn = require('cross-spawn');

const { makeGreen } = require('./utils/tools');
const { version, name } = require('../package.json');
// 当前 package.json 的版本号

function run() {
  const program = new Command();
  const actionMap = {
    build: {
      command: 'build',
      description: '项目打包',
    },
    start: {
      command: 'start',
      description: '启动开发环境项目',
    },
  };
  const args = process.argv.slice(2);
  const scriptIndex = args.findIndex(
    x => x === 'build' || x === 'start' || x === 'test'
  );
  const nodeArgs = [];

  program
    .command(actionMap.build.command)
    .description(actionMap.build.description)
    .option('-c,--config <configPath>', '配置文件路径')
    .option('--env <environment>', '添加环境变量', 'development')
    .action(() => {
      const result = spawn.sync(
        process.execPath,
        nodeArgs
          .concat(require.resolve('./scripts/build'))
          .concat(args.slice(scriptIndex + 1)),
        { stdio: 'inherit' }
      );
      process.exit(result.status);
    });

  program
    .command(actionMap.start.command)
    .description(actionMap.start.description)
    .option('-c,--config <configPath>', '配置文件路径')
    .option('--env <environment>', '添加环境变量', 'development')
    .action(() => {
      const result = spawn.sync(
        process.execPath,
        nodeArgs
          .concat(require.resolve('./scripts/start'))
          .concat(args.slice(scriptIndex + 1)),
        { stdio: 'inherit' }
      );
      process.exit(result.status);
    });
  program.name(name).usage(`<${Object.keys(actionMap).join('|')}> [options]`);

  // 定义脚手架版本
  program.version(version, '-v, --version');
  program.parse(process.argv);

  if (!args.length) {
    program.outputHelp(makeGreen);
    process.exit(1);
  }
}

module.exports = run;
