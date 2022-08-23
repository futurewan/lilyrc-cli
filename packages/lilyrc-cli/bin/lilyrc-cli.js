#!/usr/bin/env node

'use strict';
process.on('unhandledRejection', err => {
  throw err;
});

const run = require('../lib/index.js');
run();
