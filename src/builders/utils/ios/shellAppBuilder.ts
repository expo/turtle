import path from 'path';
import util from 'util';

import copy from 'copy';
import { ImageUtils, IosShellApp } from 'xdl';
import _ from 'lodash';

import * as commonUtils from 'turtle/builders/utils/common';
import * as imageHelpers from 'turtle/builders/utils/image';
import logger from 'turtle/logger/index';
import { IContext } from 'turtle/builders/ios/context';
import { IJob } from 'turtle/job';

const copyAsync = util.promisify(copy);

export default async function runShellAppBuilder(ctx: IContext, job: IJob): Promise<any> {
  const { config: jobConfig, manifest, sdkVersion: _sdkVersionFromJob } = job;
  const { buildType, releaseChannel } = jobConfig;
  const sdkVersion = _.get(manifest, 'sdkVersion', _sdkVersionFromJob);
  const applicationFilesSrc = path.join(
    ctx.workingDir,
    'shellAppBase-builds',
    buildType as string,
    '**',
    '*',
  );
  await copyAsync(applicationFilesSrc, ctx.baseArchiveDir);

  logger.info(
    { buildPhase: 'icons setup' },
    'ImageUtils: setting image functions to alternative sharp implementations',
  );
  ImageUtils.setResizeImageFunction(imageHelpers.resizeIconWithSharpAsync);
  ImageUtils.setGetImageDimensionsFunction(imageHelpers.getImageDimensionsWithSharpAsync);
  const shellAppParams = {
    url: commonUtils.getExperienceUrl(job),
    sdkVersion,
    action: 'configure',
    type: buildType,
    releaseChannel,
    archivePath: ctx.archiveDir,
    privateConfigData: job.config,
    verbose: true,
    output: ctx.outputPath,
    expoSourcePath: path.join(ctx.workingDir, 'ios'),
    manifest,
  };

  logger.info({ buildPhase: 'configuring NSBundle' }, 'configuring NSBundle...');
  return await IosShellApp.configureAndCopyArchiveAsync(shellAppParams);
}
