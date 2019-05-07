import * as fs from 'fs-extra';

import { uploadFile } from 'turtle/aws/s3';
import config from 'turtle/config';
import logger from 'turtle/logger';

var exec = require('child_process').exec

interface IUploadCtx {
  fakeUploadBuildPath?: string;
  s3FileKey?: string;
  uploadPath: string;
}

export async function uploadBuildToS3(ctx: IUploadCtx) {
  if (config.builder.fakeUpload) {
    const l = logger.child({ buildPhase: 'copying build artifact' });
    const { fakeUploadBuildPath, uploadPath } = ctx;
    l.info('copying build to fake upload directory');
    await fs.copy(uploadPath, fakeUploadBuildPath as string);
    l.info(`copied build to ${fakeUploadBuildPath}`);
    return fakeUploadBuildPath as string;
  } else {
    const l = logger.child({ buildPhase: 'uploading to S3' });
    l.info('uploading build artifact to S3');
    const { Location: fileLocation } = await uploadFile({
      key: ctx.s3FileKey as string,
      srcPath: ctx.uploadPath,
    });
    l.info(`done uploading build artifact to S3 (${fileLocation})`);
    return fileLocation;
  }
}

export async function uploadBuildToTestFlight(ctx: IUploadCtx, options: Object) {
    var cmd = 'fastlane run upload_to_testflight';
    cmd += ' username:"' + options.username + '"';
    cmd += ' ipa:"' + ctx.uploadPath + '"';
    cmd += ' apple_id:"' + ctx.appUUID + '"';
    cmd += ' skip_submission:true';

    var runtimeOptions = { env: Object.assign({}, process.env) };
    runtimeOptions.env.FASTLANE_PASSWORD = options.password;
    if (options.timeout) runtimeOptions.timeout = options.timeout;

    exec(cmd, runtimeOptions, (err, stdout, stderr) => {
        //TODO(sierrakaplan)
    });
}
