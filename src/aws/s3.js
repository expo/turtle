import AWS from 'aws-sdk';
import _ from 'lodash';
import fs from 'fs-extra';

import config, { isOffline } from 'turtle/config';

const s3 = createS3Object();

export default s3;

export async function uploadFile({ bucketName = config.s3.bucket, key, srcPath }) {
  return await s3
    .upload({
      Bucket: bucketName,
      Key: key,
      Body: fs.createReadStream(srcPath),
    })
    .promise();
}

function createS3Object() {
  return isOffline()
    ? null
    : new AWS.S3({
        ..._.pick(config.aws, ['accessKeyId', 'secretAccessKey']),
        ..._.pick(config.s3, ['region', 'bucket']),
      });
}
