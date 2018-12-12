import path from 'path';
import config from 'turtle/config';
import { ExponentTools } from 'xdl';
import { PLATFORMS } from 'turtle/constants';

export function formatShellAppDirectory(sdkVersion: string) {
  const majorSdkVersion = ExponentTools.parseSdkMajorVersion(sdkVersion);
  return config.builder.useLocalWorkingDir
    ? path.join(config.directories.workingDir, 'local')
    : path.join(config.directories.workingDir, PLATFORMS.ANDROID, `sdk${majorSdkVersion}`);
}
