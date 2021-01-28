import last from 'lodash/last';
import trim from 'lodash/trim';
import path from 'path';
import semver from 'semver';

import { ExponentTools } from '../../xdl';

import { checkSystem, ensureShellAppIsPresent } from 'turtle/bin/setup/utils/common';
import { IToolDefinition } from 'turtle/bin/setup/utils/toolsDetector';
import { formatShellAppDirectory } from 'turtle/builders/utils/ios/workingdir';
import config from 'turtle/config';
import { PLATFORMS } from 'turtle/constants';
import logger from 'turtle/logger';

const REQUIRED_TOOLS: IToolDefinition[] = [
  {
    command: 'bash',
    missingDescription: 'Please install bash',
  },
  {
    command: 'fastlane',
    missingDescription: 'Please check https://docs.fastlane.tools/getting-started/ios/setup/',
    versionCheckFn: async () => {
      const MINIMAL_VERSION = '2.99.0';

      const { stdout } = await ExponentTools.spawnAsyncThrowError(
        'fastlane',
        ['--version'],
        { stdio: 'pipe', env: { ...process.env, FASTLANE_SKIP_UPDATE_CHECK: '1', LC_ALL: 'en_US.UTF-8' } },
      );
      const fastlaneVersion = parseFastlaneVersion(stdout);
      if (fastlaneVersion && !semver.satisfies(fastlaneVersion, `>= ${MINIMAL_VERSION}`)) {
        throw new Error(
          `Your fastlane is on version ${fastlaneVersion}. Please upgrade it to at least ${MINIMAL_VERSION}.`,
        );
      }
    },
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

      if (status !== 0) {
        return false;
      }

      try {
        await ExponentTools.spawnAsyncThrowError('ibtool', ['--version'], { stdio: 'pipe' });
      } catch (err) {
        if (err.stderr) {
          const stderr = err.stderr.trim();
          if (stderr.match(/Agreeing to the Xcode\/iOS license/)) {
            logger.error('You have not accepted the Xcode license. Run \'sudo xcodebuild -runFirstLaunch\' to do so.');
            return false;
          }
          if (stderr.match(/The bundle is damaged or missing necessary resources/)) {
            logger.error(
              'Make sure to install additional required components. Run \'sudo xcodebuild -runFirstLaunch\' to do so.',
            );
            return false;
          }
        }
      }

      return true;
    },
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
  return path.join(config.directories.shellTarballsDir, PLATFORMS.IOS, `sdk${sdkMajorVersion}`);
}

function parseFastlaneVersion(stdout: string) {
  const lastLine = last(trim(stdout).split('\n'));
  if (!lastLine) {
    return null;
  }
  return last(lastLine.split(' ')) || null;
}
