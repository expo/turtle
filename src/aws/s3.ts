import AWS from 'aws-sdk';
import _ from 'lodash';
import fs from 'fs-extra';

import config from 'turtle/config';

interface FileUploadParams {
  bucketName?: string;
  key: string;
  srcPath: string;
}

const s3 = new AWS.S3({
  ..._.pick(config.aws, ['accessKeyId', 'secretAccessKey']),
  ..._.pick(config.s3, ['region']),
});

export default s3;

export async function uploadFile({ bucketName = config.s3.bucket, key, srcPath }: FileUploadParams) {
  return await s3
    .upload({
      Bucket: bucketName,
      Key: key,
      Body: fs.createReadStream(srcPath),
    })
    .promise();
}
