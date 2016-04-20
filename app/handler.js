'use strict'

// required to execute custom binaries in Lambda
process.env['PATH'] =
  process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT']

const assert = require('assert')
const fdsh = require('fdsh-client')
const s3 = require('./s3')

function handler(event, context, callback) {
  _initEvent(event, context)
    .then(event => {
      return fdsh.createClient(event.env.host,
                               event.env.port,
                               event.env.path,
                               // TODO: make less API-Gateway'esque
                               event.params.path.service,
                               event.env.userId,
                               event.env.password)
    })
    .then(client => {
      return fdsh.invokeMethod(client,
                               // TODO: make less API-Gateway'esque
                               event.params.path.method,
                               // TODO: make less API-Gateway'esque
                               event.params.querystring,
                               event.env.cert,
                               event.env.key)
    })
    .then(result => callback(null, result))
    .catch(err => {
      console.log(err)
      callback(err)
    })
}

function _initEvent(event, context) {
  return new Promise((resolve, reject) => {
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

      resolve(event)
    }).catch(err => reject(err))
  })
}

exports.handler = handler
