import path from 'path';
import util from 'util';

import { ExponentTools } from '@expo/xdl';
import fs from 'fs-extra';
import _which from 'which';

import ensureAndroidSDKIsPresent from 'turtle/bin/setup/android/sdk';
import { checkSystem, ensureShellAppIsPresent } from 'turtle/bin/setup/utils/common';
import { IToolDefinition } from 'turtle/bin/setup/utils/toolsDetector';
import { formatShellAppDirectory } from 'turtle/builders/utils/android/workingdir';
import config from 'turtle/config';
import { PLATFORMS } from 'turtle/constants';
import logger from 'turtle/logger';

const which = util.promisify(_which);
const REQUIRED_TOOLS: IToolDefinition[] = [
  {
    command: 'bash',
    missingDescription: 'Please install bash',
  },
  {
    command: 'javac',
    missingDescription:
      `Please install JDK 11 - keep in mind that other versions might not be supported by Android`,
    testFn: async () => {
      const { status, stdout } = await ExponentTools.spawnAsyncThrowError(
        'java',
        ['-version'],
        { stdio: 'pipe' },
      );
      if (stdout.match(/no java runtime present/i)) {
        return false;
      }
      return status === 0;
    },
  },
];
const LOGGER_FIELDS = { buildPhase: 'setting up environment' };
const l = logger.child(LOGGER_FIELDS);

export default async function setup(sdkVersion?: string) {
  await checkSystem(REQUIRED_TOOLS);
  await prepareAndroidEnv();
  if (sdkVersion) {
    await ensureShellAppIsPresent(
      sdkVersion,
      { formatShellAppDirectory, formatShellAppTarballUriPath },
      _shellAppPostDownloadAction,
    );
  }
}

async function prepareAndroidEnv() {
  await fs.ensureDir(config.directories.androidDependenciesDir);
  const sdkConfig = await ensureAndroidSDKIsPresent();
  _setEnvVars(sdkConfig.envVars);
  _alterPath(sdkConfig.path);
}

function formatShellAppTarballUriPath(sdkMajorVersion: string) {
  return path.join(config.directories.shellTarballsDir, PLATFORMS.ANDROID, `sdk${sdkMajorVersion}`);
}

async function _shellAppPostDownloadAction(sdkVersion: string, workingdir: string) {
  const inWorkingdir = (filename: string) => path.join(workingdir, filename);

  if (await fs.pathExists(inWorkingdir('universe-package.json'))) {
    // legacy shell app built from universe
    await fs.move(inWorkingdir('package.json'), inWorkingdir('exponent-package.json'));
    await fs.move(inWorkingdir('universe-package.json'), inWorkingdir('package.json'));
    await _installNodeModules(workingdir);
    await fs.move(inWorkingdir('package.json'), inWorkingdir('universe-package.json'));
    await fs.move(inWorkingdir('exponent-package.json'), inWorkingdir('package.json'));
  } else {
    // new shell app built from expo or not
    await _installNodeModules(workingdir);
  }

  // TODO: remove this after making sure that we don't need node_modules in tools-public for older sdks
  if (ExponentTools.parseSdkMajorVersion(sdkVersion) < 33) {
    const toolsPublicDir = path.join(workingdir, 'tools-public');
    await _installNodeModules(toolsPublicDir);
  }
}

async function _installNodeModules(cwd: string) {
  l.info(`installing dependencies in ${cwd} directory...`);
  const command = await _shouldUseYarnOrNpm();
  // Keep in sync with /Dockerfile
  // --prod requires --ignore-scripts (otherwise expo-yarn-workspaces errors as missing)
  await ExponentTools.spawnAsyncThrowError(command, ['install', '--ignore-scripts', '--production'], {
    pipeToLogger: true,
    loggerFields: LOGGER_FIELDS,
    cwd,
  });
  l.info('dependencies installed!');
}

async function _shouldUseYarnOrNpm() {
  try {
    await which('yarn');
    return 'yarn';
  } catch (err) {
    return 'npm';
  }
}

function _setEnvVars(envVars: object) {
  Object
    .entries(envVars)
    .forEach(([key, value]) => process.env[key] = value);
}

function _alterPath(newPaths: string[]) {
  const currentPaths = process.env.PATH ? process.env.PATH.split(':') : [];
  const paths = [...newPaths, ...currentPaths];
  process.env.PATH = paths.join(':');
}
