import * as fs from 'fs-extra';
import { ExponentTools } from 'xdl';

import { uploadFile } from 'turtle/aws/s3';
import { IContext } from 'turtle/builders/ios/context';
import config from 'turtle/config';
import logger from 'turtle/logger';

interface IUploadCtx {
  fakeUploadBuildPath?: string;
  s3FileKey?: string;
  uploadPath: string;
}

interface IJobOptions {
  appleId: string;
  applePassword: string;
  appSpecificPassword: string;
  appName: string;
  companyName: string;
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

export async function uploadBuildToTestFlight(ctx: IContext, options: IJobOptions, bundleIdentifier: string) {
  const fastlaneEnvVars = {
    FASTLANE_USER: options.appleId,
    FASTLANE_SKIP_UPDATE_CHECK: 1,
    FASTLANE_DISABLE_COLORS: 1,
    CI: 1,
    LC_ALL: 'en_US.UTF-8',
    FASTLANE_PASSWORD: options.applePassword,
    FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD: options.appSpecificPassword,
  };

  await runFastlane([
    'produce',
    '--username',
    options.appleId,
    '--app_identifier', // bundle id
    bundleIdentifier,
    '--app_name',
    options.appName,
    '--app_version',
    '1.0',
    '--company_name',
    options.companyName,
  ], fastlaneEnvVars, { buildPhase: 'Creating App on AppStoreConnect' });

  await runFastlane([
    'pilot',
    'upload',
    '--username',
    options.appleId,
    '--ipa',
    ctx.uploadPath,
    '--apple_id', // The unique App ID provided by App Store Connect
    process.env.PRODUCE_APPLE_ID,
    '--skip_submission',
    '--skip_waiting_for_build_processing',
  ], fastlaneEnvVars, { buildPhase: 'Uploading IPA to Testflight' });

}

async function runFastlane(fastlaneArgs, fastlaneEnvVars, loggerFields) {
  await ExponentTools.spawnAsyncThrowError('fastlane', fastlaneArgs, {
    env: {
      ...process.env,
      ...fastlaneEnvVars,
    },
    pipeToLogger: true,
    dontShowStdout: false,
    loggerFields,
  });
}
