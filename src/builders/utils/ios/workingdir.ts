import path from 'path';

import { ExponentTools } from '@expo/xdl';

import { IShellAppDirectoryConfig } from 'turtle/builders/utils/workingdir';
import config from 'turtle/config';
import { IOS_BUILD_TYPES, PLATFORMS } from 'turtle/constants';

export function formatShellAppDirectory({ sdkVersion, buildType }: IShellAppDirectoryConfig) {
  const { workingDir } = config.directories;
  if (buildType === IOS_BUILD_TYPES.CLIENT) {
    return path.join(workingDir, PLATFORMS.IOS, 'client');
  } else if (config.builder.useLocalWorkingDir) {
    return path.join(workingDir, 'local');
  } else {
    const majorVersion = ExponentTools.parseSdkMajorVersion(sdkVersion);
    return path.join(workingDir, PLATFORMS.IOS, `sdk${majorVersion}`);
  }
}
