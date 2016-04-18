'use strict';

// required to execute custom binaries in Lambda
process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

const fdsh = require('fdsh-client');

function handler(event, context, callback) {
  callback(null, 'Hello world.');
};

exports.handler = handler;
