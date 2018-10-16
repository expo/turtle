import path from 'path';

import { ExponentTools } from 'xdl';

import config from 'turtle/config';
import { checkSystem, ensureShellAppIsPresent } from 'turtle/bin/setup/utils/common';
import { IToolDefinition } from 'turtle/bin/setup/utils/toolsDetector';
import { formatShellAppDirectory } from 'turtle/builders/utils/ios/workingdir';

const REQUIRED_TOOLS: Array<IToolDefinition> = [
  {
    command: 'fastlane',
    missingDescription: 'Please check https://docs.fastlane.tools/getting-started/ios/setup/',
  },
  {
    command: 'xcode',
    missingDescription: 'Please ensure xcode is properly installed',
    testFn: async () => {
      const { status, stdout } = await ExponentTools.spawnAsyncThrowError(
        'xcodebuild',
        ['-version'],
        { stdio: 'pipe' }
      );
      if (stdout.match(/requires xcode/i)) {
        return false;
      }
      return status === 0;
    }
  },
];

export default async function setup(sdkVersion?: string) {
  await checkSystem(REQUIRED_TOOLS);
  if (sdkVersion) {
    await ensureShellAppIsPresent(sdkVersion, {
      formatShellAppDirectory,
      formatShellAppTarballUriPath,
    });
  }
}

function formatShellAppTarballUriPath(sdkMajorVersion: string) {
  return path.join(config.directories.shellTarballsDir, 'ios', `sdk${sdkMajorVersion}`);
}
