import path from 'path';
import util from 'util';

import fs from 'fs-extra';
import _which from 'which';
import { ExponentTools } from 'xdl';

import ensureAndroidNDKIsPresent from 'turtle/bin/setup/android/ndk';
import ensureAndroidSDKIsPresent from 'turtle/bin/setup/android/sdk';
import { checkSystem, ensureShellAppIsPresent } from 'turtle/bin/setup/utils/common';
import { IToolDefinition } from 'turtle/bin/setup/utils/toolsDetector';
import { formatShellAppDirectory } from 'turtle/builders/utils/android/workingdir';
import config from 'turtle/config';
import { PLATFORMS } from 'turtle/constants';

const which = util.promisify(_which);
const REQUIRED_TOOLS: IToolDefinition[] = [
  {
    command: 'bash',
    missingDescription: 'Please install bash',
  },
  {
    command: 'gulp',
    missingDescription: 'Run `npm install -g gulp-cli` (or `yarn global add gulp-cli`) to install gulp',
  },
  {
    command: 'javac',
    missingDescription: 'Please install JDK (version 8 or newer) - check https://jdk.java.net/',
    testFn: async () => {
      const { status, stdout } = await ExponentTools.spawnAsyncThrowError(
        'javac',
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

export default async function setup(logger: any, sdkVersion?: string) {
  await checkSystem(REQUIRED_TOOLS, logger);
  await prepareAndroidEnv(logger);
  if (sdkVersion) {
    await ensureShellAppIsPresent(
      sdkVersion,
      { formatShellAppDirectory, formatShellAppTarballUriPath },
      logger,
      _shellAppPostDownloadAction,
    );
  }
}

async function prepareAndroidEnv(logger: any) {
  await fs.ensureDir(config.directories.androidDependenciesDir);
  const sdkConfig = await ensureAndroidSDKIsPresent(logger);
  const ndkConfig = await ensureAndroidNDKIsPresent(logger);
  _setEnvVars({ ...sdkConfig.envVars, ...ndkConfig.envVars });
  _alterPath([...sdkConfig.path, ...sdkConfig.path]);
}

function formatShellAppTarballUriPath(sdkMajorVersion: string) {
  return path.join(config.directories.shellTarballsDir, PLATFORMS.ANDROID, `sdk${sdkMajorVersion}`);
}

async function _shellAppPostDownloadAction(workingdir: string, logger: any) {
  const inWorkingdir = (filename: string) => path.join(workingdir, filename);

  await fs.move(inWorkingdir('package.json'), inWorkingdir('exponent-package.json'));
  await fs.move(inWorkingdir('universe-package.json'), inWorkingdir('package.json'));
  await _installNodeModules(workingdir, logger);
  await fs.move(inWorkingdir('package.json'), inWorkingdir('universe-package.json'));
  await fs.move(inWorkingdir('exponent-package.json'), inWorkingdir('package.json'));

  // TODO: remove following lines after upgrading android shell app
  const toolsPublicDir = path.join(workingdir, 'tools-public');
  await _installNodeModules(toolsPublicDir, logger);
}

async function _installNodeModules(cwd: string, logger: any) {
  const LOGGER_FIELDS = { buildPhase: 'setting up environment' };
  const l = logger.child(LOGGER_FIELDS);
  l.info(`installing dependencies in ${cwd} directory...`);
  const command = await _shouldUseYarnOrNpm();
  await ExponentTools.spawnAsyncThrowError(command, ['install'], {
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
