'use strict'

const aws = require('aws-sdk')
const s3 = new aws.S3({ apiVersion: '2006-03-01' })

/**
 * Make a request for the specified object in S3.
 * @param {string} bucket The AWS bucket name
 * @param {string} key The path to the desired object within the given bucket.
 * @return {Promise} A Promise encapsulating the async S3 request.
 */
function getData(bucket, key) {
  const params = {
    Bucket: bucket,
    Key: decodeURIComponent(key.replace(/\+/g, ' '))
  };

  return new Promise((resolve, reject) => {
    s3.getObject(params, (err, data) => {
      if (err) {
        const message = `Error getting object ${key} from bucket ${bucket}. ` +
          'Be sure they exist and your function is in the same region.';
        reject(err)
      } else {
        resolve (data)
      }
    })
  })
}

exports.getData = getData
