'use strict';

// required to execute custom binaries in Lambda
process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

const assert = require('assert');
const fdsh = require('fdsh-client');
const s3 = require('./s3');

function handler(event, context, callback) {
  initEvent(event, context, callback, initEventCallback);

  function initEventCallback(err) {
    if (err) return handleErr(err, callback);
    fdsh.createClient(event.env.host,
                      event.env.port,
                      event.env.path,
                      // TODO: make less API-Gateway'esque
                      event.params.path.service,
                      event.env.userId,
                      event.env.password,
                      createClientCallback);
  }

  function createClientCallback(err, client) {
    if (err) return handleErr(err, callback);
    fdsh.invokeMethod(client,
                      // TODO: make less API-Gateway'esque
                      event.params.path.method,
                      // TODO: make less API-Gateway'esque
                      event.params.querystring,
                      event.env.cert,
                      event.env.key,
                      invokeMethodCallback);
  }

  function invokeMethodCallback(err, result, raw, soapHeader) {
    callback(err, result);
  }
}

function initEvent(event, context, callback, initEventCallback) {
  // TODO: assert presence of expected env vars
  // TODO: put more console logging in place

  // define which variables need to be set and where their data live in S3
  let dataDefs = [
    {
      obj: event.env,
      objKey: 'cert', // event.env.cert
      s3Path: event.env.certS3Path
    }, {
      obj: event.env,
      objKey: 'key', // event.env.key
      s3Path: event.env.keyS3Path
    }
  ]

  // only grab data from S3 for variables that aren't already set
  dataDefs = dataDefs.filter(dd => typeof dd.obj[dd.objKey] === 'undefined')

  // create promises
  for (var dd of dataDefs) {
    dd.promise = s3.getData(event.env.s3Bucket, dd.s3Path)
  }

  Promise.all(dataDefs.map(dd => dd.promise)).then(values => {
    // "zip" data defs and their respective S3 values into new objects
    const objects = dataDefs.map((dd, i) => ({
      dd: dd,
      value: values[i].Body
    }))

    // assign the results of each promise to the appropriate variables
    for (var obj of objects) { obj.dd.obj[obj.dd.objKey] = obj.value }

    initEventCallback()
  }).catch(err => initEventCallback(err))
}

function handleErr(err, callback) {
  console.log(err);
  callback(err);
}

exports.handler = handler;
