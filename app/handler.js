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
  // TODO: clean this up so that it's prettier and parallelized (promises?)
  // TODO: assert presence of expected env vars
  // TODO: put more console logging in place

  if (event.env.cert) {
    initKey();
  } else {
    initCert();
  }

  function initCert() {
    s3.getData(event.env.s3Bucket,
               event.env.certS3Path,
	       function (err, data) {
                 if (err) return initEventCallback(err);
                 event.env.cert = data;
                 initKey();
	       });
  }

  function initKey() {
    if (event.env.key) {
      initEventCallback();
    } else {
      s3.getData(event.env.s3Bucket,
                 event.env.keyS3Path,
	         function (err, data) {
                   if (err) return initEventCallback(err);
                   event.env.key = data;
                   initEventCallback();
	         });
    }
  }
}

function handleErr(err, callback) {
  console.log(err);
  callback(err);
}

exports.handler = handler;
