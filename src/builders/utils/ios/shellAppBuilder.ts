import path from 'path';
import util from 'util';

import { ImageUtils, IosShellApp } from '@expo/xdl';
import copy from 'copy';
import _ from 'lodash';

import { IContext } from 'turtle/builders/ios/context';
import * as commonUtils from 'turtle/builders/utils/common';
import * as imageHelpers from 'turtle/builders/utils/image';
import { IOS_BUILD_TYPES } from 'turtle/constants/index';
import { IJob } from 'turtle/job';
import logger from 'turtle/logger/index';

const copyAsync = util.promisify(copy);

export default async function runShellAppBuilder(ctx: IContext, job: IJob): Promise<any> {
  const { config: jobConfig, manifest, sdkVersion: sdkVersionFromJob } = job;
  const { buildType, releaseChannel } = jobConfig;
  const sdkVersion = _.get(manifest, 'sdkVersion', sdkVersionFromJob);

  await copyAsync(ctx.applicationFilesSrc, ctx.baseArchiveDir);

  logger.info(
    { buildPhase: 'icons setup' },
    'ImageUtils: setting image functions to alternative sharp implementations',
  );
  ImageUtils.setResizeImageFunction(imageHelpers.resizeIconWithSharpAsync);
  ImageUtils.setGetImageDimensionsFunction(imageHelpers.getImageDimensionsWithSharpAsync);
  const shellAppParams = {
    action: 'configure',
    type: buildType,
    archivePath: ctx.archiveDir,
    privateConfigData: job.config,
    expoSourcePath: path.join(ctx.workingDir, 'ios'),
    manifest,
    output: ctx.outputPath,
    verbose: true,
    shellAppSdkVersion: sdkVersion,
  };
  if (buildType === IOS_BUILD_TYPES.CLIENT) {
    Object.assign(shellAppParams, {
      workspacePath: path.join(ctx.workingDir, 'ios'),
    });
  } else {
    Object.assign(shellAppParams, {
      url: commonUtils.getExperienceUrl(job.experienceName, job.config.publicUrl),
      releaseChannel,
      sdkVersion,
    });
  }

  logger.info({ buildPhase: 'configuring NSBundle' }, 'configuring NSBundle...');
  return await IosShellApp.configureAndCopyArchiveAsync(shellAppParams);
}
