import * as fs from 'fs-extra';

import { uploadFile } from 'turtle/aws/s3';
import config from 'turtle/config';
import logger from 'turtle/logger';

import { ExponentTools } from 'xdl';

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
  const fastlaneEnvVars = {
    FASTLANE_SKIP_UPDATE_CHECK: 1,
    FASTLANE_DISABLE_COLORS: 1,
    CI: 1,
    LC_ALL: 'en_US.UTF-8',
    FASTLANE_PASSWORD: options.password,
  };

  const fastlaneArgs = [
    'run upload_to_testflight',
    'username:',
    '"' + options.username + '"',
    'ipa:',
    ctx.uploadPath,
    'apple_id:',
    ctx.appUUID,
    'skip_submission:',
    'true',
  ];

  const loggerFields = { buildPhase: 'uploading IPA' };

  const { status, stdout } = await ExponentTools.spawnAsyncThrowError('fastlane', fastlaneArgs, {
    env: {
      ...process.env,
      ...fastlaneEnvVars,
    },
    pipeToLogger: true,
    dontShowStdout: false,
    loggerFields,
  });
}
