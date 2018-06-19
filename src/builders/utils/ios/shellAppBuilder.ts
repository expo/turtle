import * as path from 'path';
import * as util from 'util';

import copy from 'copy';
import { ImageHelpers, IosIcons, IosShellApp } from 'xdl';

import * as commonUtils from 'turtle/builders/utils/common';
import config from 'turtle/config';
import logger from 'turtle/logger/index';
import { IContext } from 'turtle/types/context';
import { IJob } from 'turtle/types/job';

const copyAsync = util.promisify(copy);

export default async function runShellAppBuilder(ctx: IContext, job: IJob): Promise<any> {
  const { buildType } = job.config;
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
  IosIcons.setResizeImageFunction(ImageHelpers.resizeIconWithSharpAsync);
  IosIcons.setGetImageDimensionsFunction(ImageHelpers.getImageDimensionsWithSharpAsync);
  const appleTeamId = config.credentials && config.credentials.teamId;
  const shellAppParams = {
    url: commonUtils.getExperienceUrl(job.experienceName),
    sdkVersion: job.experience.sdkVersion,
    action: 'configure',
    type: buildType,
    releaseChannel: job.config.releaseChannel,
    archivePath: ctx.archiveDir,
    privateConfigData: job.config,
    verbose: true,
    output: ctx.outputPath,
    expoSourcePath: path.join(config.builder.workingDir, 'ios'),
    ...appleTeamId ? { appleTeamId } : {},
  };

  logger.info({ buildPhase: 'configuring NSBundle' }, 'configuring NSBundle...');
  return await IosShellApp.configureAndCopyArchiveAsync(shellAppParams);
}
