import * as fs from 'fs-extra';
import * as _ from 'lodash';
import * as path from 'path';

import { ExponentTools } from 'xdl';

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

let SUPPORTED_SDK_VERSIONS: Array<number>;

export default async function iosBuilder(job: IJob): Promise<IJobResult> {
  await ensureCanBuildSdkVersion(job);

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

async function ensureCanBuildSdkVersion(job: IJob) {
  if (config.builder.useLocalWorkingDir) {
    return;
  }

  if (!SUPPORTED_SDK_VERSIONS) {
    SUPPORTED_SDK_VERSIONS = await findSupportedSdkVersions();
  }

  const targetMajorSdkVersion = ExponentTools.parseSdkMajorVersion(job.sdkVersion || job.manifest.sdkVersion);
  if (!_.includes(SUPPORTED_SDK_VERSIONS, targetMajorSdkVersion)) {
    throw new Error(`Unsupported SDK Version!`);
  }
}

async function findSupportedSdkVersions(): Promise<Array<number>> {
  const SDK_DIR_PREFIX = 'sdk';
  const files = await fs.readdir(path.join(config.builder.workingDir, 'ios'));
  const sdks = files.filter(file => file.startsWith(SDK_DIR_PREFIX));
  return sdks.map(sdk => parseInt(sdk.substr(SDK_DIR_PREFIX.length)));
}
