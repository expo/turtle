import path from 'path';
import config from 'turtle/config';

export function formatShellAppDirectory(_sdkVersion: string) {
  return config.builder.useLocalWorkingDir
    ? path.join(config.directories.workingDir, 'local')
    : path.join(config.directories.workingDir, 'android');
}
