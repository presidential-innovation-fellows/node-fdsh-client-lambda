'use strict';

const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });

function getData(bucket, key, callback) {
  const params = {
    Bucket: bucket,
    Key: decodeURIComponent(key.replace(/\+/g, ' '))
  };

  s3.getObject(params, function s3Callback(err, data) {
    if (err) {
      const message = `Error getting object ${key} from bucket ${bucket}. ` +
        'Be sure they exist and your function is in the same region.';
      callback(message);
    } else {
      callback(null, data.Body);
    }
  });
}

exports.getData = getData;
