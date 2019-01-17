import AWS from 'aws-sdk';
import fs from 'fs-extra';
import _ from 'lodash';

import config from 'turtle/config';

interface IFileUploadParams {
  bucketName?: string;
  key: string;
  srcPath: string;
}

const s3 = new AWS.S3({
  ..._.pick(config.aws, ['accessKeyId', 'secretAccessKey']),
  ..._.pick(config.s3, ['region']),
});

export default s3;

export async function uploadFile({ bucketName = config.s3.bucket, key, srcPath }: IFileUploadParams) {
  return await s3
    .upload({
      Bucket: bucketName,
      Key: key,
      Body: fs.createReadStream(srcPath),
    })
    .promise();
}
