import fs from 'fs-extra';
import path from 'path';
import { ExponentTools } from 'xdl';

import config from 'turtle/config';
import { IJob } from 'turtle/job';

let SUPPORTED_SDK_VERSIONS: number[];

export async function ensureCanBuildSdkVersion(job: IJob) {
  if (config.builder.useLocalWorkingDir) {
    return;
  }

  if (!SUPPORTED_SDK_VERSIONS) {
    SUPPORTED_SDK_VERSIONS = await findSupportedSdkVersions(job.platform);
  }

  const targetMajorSdkVersion = ExponentTools.parseSdkMajorVersion(job.sdkVersion || job.manifest.sdkVersion);
  if (!SUPPORTED_SDK_VERSIONS.includes(targetMajorSdkVersion)) {
    throw new Error(`Unsupported SDK Version!`);
  }
}

async function findSupportedSdkVersions(platform: 'android' | 'ios'): Promise<number[]> {
  const SDK_DIR_PREFIX = 'sdk';
  const files = await fs.readdir(path.join(config.directories.workingDir, platform));
  const sdks = files.filter((file) => file.startsWith(SDK_DIR_PREFIX));
  return sdks.map((sdk) => parseInt(sdk.substr(SDK_DIR_PREFIX.length), 10));
}
