import * as fs from 'fs-extra';
import * as _ from 'lodash';

import buildArchive from 'turtle/builders/ios/archive';
import { createBuilderContext } from 'turtle/builders/ios/context';
import buildSimulator from 'turtle/builders/ios/simulator';
import { logErrorOnce } from 'turtle/builders/utils/common';
import { uploadBuildToS3 } from 'turtle/builders/utils/uploader';
import config from 'turtle/config';
import { IOS } from 'turtle/constants/index';
import { IContext } from 'turtle/builders/ios/context';
import { IJob, IJobResult } from 'turtle/job';

const { BUILD_TYPES } = IOS;

export default async function iosBuilder(job: IJob): Promise<IJobResult> {
  const ctx = createBuilderContext(job);

  try {
    await initBuilder(ctx);

    const { buildType } = job.config;
    if (buildType === BUILD_TYPES.SIMULATOR) {
      await buildSimulator(ctx, job);
    } else if (buildType === BUILD_TYPES.ARCHIVE) {
      await buildArchive(ctx, job);
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
  Object.values(_.pick(ctx, ['appDir', 'provisioningProfileDir']));
