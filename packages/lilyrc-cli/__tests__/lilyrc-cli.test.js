'use strict';

const lilyrcCli = require('..');
const assert = require('assert').strict;

assert.strictEqual(lilyrcCli(), 'Hello from lilyrcCli');
console.info("lilyrcCli tests passed");
