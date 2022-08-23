'use strict';

const chalk = require('chalk');

const tools = {
  makeGreen: function makeGreen(txt) {
    return chalk.green(txt);
  },
};
module.exports = tools;
