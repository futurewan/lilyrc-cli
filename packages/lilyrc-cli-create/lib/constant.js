'use strict';
const os = require('os');

// 用户的根目录
// const HOME = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME']

// 配置文件目录
const RC = `${os.homedir()}/.lily-cli.rc`;

module.exports = {
  // 模板下载地址可配置
  DEFAULTS: {
    registry:
      'https://github.com/futurewan/react-base-project/archive/refs/heads',
  },
  RC,
};
