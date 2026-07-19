// This file is loaded BEFORE everything else via Node --require flag.
// It patches util.isNullOrUndefined which was removed in Node.js 24+
// but is still called internally by @tensorflow/tfjs-node@3.x
const util = require('util');
if (typeof util.isNullOrUndefined !== 'function') {
  util.isNullOrUndefined = (value) => value === null || value === undefined;
}
