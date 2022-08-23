'use strict';

const lilyrcTemplate = require('..');
const assert = require('assert').strict;

assert.strictEqual(lilyrcTemplate(), 'Hello from lilyrcTemplate');
console.info("lilyrcTemplate tests passed");
