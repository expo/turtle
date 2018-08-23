import * as path from 'path';
import * as util from 'util';

import copy from 'copy';
import { IosIcons, IosShellApp } from 'xdl';

import * as commonUtils from 'turtle/builders/utils/common';
import * as imageHelpers from 'turtle/builders/utils/ios/image';
import config from 'turtle/config';
import logger from 'turtle/logger/index';
import { IContext } from 'turtle/builders/ios/context';
import { IJob } from 'turtle/job';

const copyAsync = util.promisify(copy);

export default async function runShellAppBuilder(ctx: IContext, job: IJob): Promise<any> {
  const { config: jobConfig, manifest, sdkVersion } = job;
  const { buildType, releaseChannel } = jobConfig;
  const applicationFilesSrc = path.join(
    config.builder.workingDir,
    'shellAppBase-builds',
    buildType as string,
    '**',
    '*',
  );
  await copyAsync(applicationFilesSrc, ctx.baseArchiveDir);

  logger.info(
    { buildPhase: 'icons setup' },
    'IosIcons: setting image functions to alternative sharp implementations',
  );
  IosIcons.setResizeImageFunction(imageHelpers.resizeIconWithSharpAsync);
  IosIcons.setGetImageDimensionsFunction(imageHelpers.getImageDimensionsWithSharpAsync);
  const shellAppParams = {
    url: commonUtils.getExperienceUrl(job.experienceName),
    sdkVersion: manifest.sdkVersion || sdkVersion,
    action: 'configure',
    type: buildType,
    releaseChannel,
    archivePath: ctx.archiveDir,
    privateConfigData: job.config,
    verbose: true,
    output: ctx.outputPath,
    expoSourcePath: path.join(config.builder.workingDir, 'ios'),
    manifest,
  };

  logger.info({ buildPhase: 'configuring NSBundle' }, 'configuring NSBundle...');
  return await IosShellApp.configureAndCopyArchiveAsync(shellAppParams);
}
