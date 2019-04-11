import path from 'path';

import { ExponentTools } from 'xdl';

import { checkSystem, ensureShellAppIsPresent } from 'turtle/bin/setup/utils/common';
import { IToolDefinition } from 'turtle/bin/setup/utils/toolsDetector';
import { formatShellAppDirectory } from 'turtle/builders/utils/ios/workingdir';
import config from 'turtle/config';
import { PLATFORMS } from 'turtle/constants';

const REQUIRED_TOOLS: IToolDefinition[] = [
  {
    command: 'bash',
    missingDescription: 'Please install bash',
  },
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
        { stdio: 'pipe' },
      );
      if (stdout.match(/requires xcode/i)) {
        return false;
      }
      return status === 0;
    },
  },
];

export default async function setup(logger: any, sdkVersion?: string) {
  await checkSystem(REQUIRED_TOOLS, logger);
  if (sdkVersion) {
    await ensureShellAppIsPresent(sdkVersion, {
      formatShellAppDirectory,
      formatShellAppTarballUriPath,
    }, logger);
  }
}

function formatShellAppTarballUriPath(sdkMajorVersion: string) {
  return path.join(config.directories.shellTarballsDir, PLATFORMS.IOS, `sdk${sdkMajorVersion}`);
}
