'use strict';

const lilyrcCliCreate = require('..');
const assert = require('assert').strict;

assert.strictEqual(lilyrcCliCreate(), 'Hello from lilyrcCliCreate');
console.info("lilyrcCliCreate tests passed");
