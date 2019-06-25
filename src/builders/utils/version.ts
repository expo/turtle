import { ExponentTools } from '@expo/xdl';
import fs from 'fs-extra';
import path from 'path';

import config from 'turtle/config';
import { IJob } from 'turtle/job';

interface IVersionsMap {
  [platform: string]: number[];
}

const versions: IVersionsMap = {};

export async function ensureCanBuildSdkVersion(job: IJob) {
  if (config.builder.useLocalWorkingDir) {
    return;
  }

  const platformVersions = await findSupportedSdkVersions(job.platform);
  const targetMajorSdkVersion = ExponentTools.parseSdkMajorVersion(job.sdkVersion || job.manifest.sdkVersion);
  if (!platformVersions.includes(targetMajorSdkVersion)) {
    throw new Error(`Unsupported SDK Version!`);
  }
}

export async function findSupportedSdkVersions(platform: 'android' | 'ios'): Promise<number[]> {
  if (versions[platform]) {
    return versions[platform];
  } else {
    const SDK_DIR_PREFIX = 'sdk';
    const files = await fs.readdir(path.join(config.directories.workingDir, platform));
    const sdks = files.filter((file) => file.startsWith(SDK_DIR_PREFIX));
    versions[platform] = sdks.map((sdk) => parseInt(sdk.substr(SDK_DIR_PREFIX.length), 10));
    return versions[platform];
  }
}
