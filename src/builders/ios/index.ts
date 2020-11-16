import fs from 'fs-extra';
import pick from 'lodash/pick';

import buildArchive from 'turtle/builders/ios/archive';
import { createBuilderContext, IContext } from 'turtle/builders/ios/context';
import buildSimulator from 'turtle/builders/ios/simulator';
import { logErrorOnce } from 'turtle/builders/utils/common';
import prepareAdHocBuildCredentials from 'turtle/builders/utils/ios/adhocBuild';
import { uploadBuildToS3 } from 'turtle/builders/utils/uploader';
import { ensureCanBuildSdkVersion } from 'turtle/builders/utils/version';
import config from 'turtle/config';
import { IOS_BUILD_TYPES } from 'turtle/constants';
import { IJob, IJobResult } from 'turtle/job';

export default async function iosBuilder(job: IJob): Promise<IJobResult> {
  if (job.config.buildType !== IOS_BUILD_TYPES.CLIENT) {
    await ensureCanBuildSdkVersion(job);
  }

  const ctx = createBuilderContext(job);

  try {
    await initBuilder(ctx);

    const { buildType } = job.config;

    if (buildType === IOS_BUILD_TYPES.CLIENT) {
      await prepareAdHocBuildCredentials(job);
    }

    if ([IOS_BUILD_TYPES.ARCHIVE, IOS_BUILD_TYPES.CLIENT].includes(buildType!)) {
      await buildArchive(ctx, job);
    } else if (buildType === IOS_BUILD_TYPES.SIMULATOR) {
      await buildSimulator(ctx, job);
    } else {
      throw new Error(`Unsupported iOS build type: ${buildType}`);
    }

    const artifactUrl = await uploadBuildToS3(ctx);
    return { artifactUrl };
  } catch (err) {
    logErrorOnce(err);
    throw err;
  } finally {
    await cleanup(ctx);
  }
}

async function initBuilder(ctx: IContext) {
  for (const dir of getTemporaryDirs(ctx)) {
    await fs.ensureDir(dir);
    await fs.chmod(dir, 0o755);
  }
}

async function cleanup(ctx: IContext) {
  if (config.builder.skipCleanup) {
    return;
  }
  await Promise.all(getTemporaryDirs(ctx).map((dir: string) => fs.remove(dir)));
}

const getTemporaryDirs = (ctx: IContext) =>
  Object.values(pick(ctx, ['appDir', 'provisioningProfileDir'])) as string[];
