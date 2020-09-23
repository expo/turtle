import os from 'os';
import path from 'path';

import { ExponentTools } from '@expo/xdl';
import decompress from 'decompress';
import fs from 'fs-extra';

import * as utils from 'turtle/bin/setup/utils/common';
import download from 'turtle/bin/setup/utils/downloader';
import config from 'turtle/config';
import logger from 'turtle/logger';

const ANDROID_SDK_URL = 'https://dl.google.com/android/repository/sdk-tools-linux-4333796.zip';

const LOGGER_FIELDS = { buildPhase: 'setting up environment' };
const l = logger.child(LOGGER_FIELDS);

export default async function ensureAndroidSDKIsPresent() {
  const androidSdkDir = path.join(config.directories.androidDependenciesDir, 'sdk');
  await utils.removeDirectoryUnlessReady(androidSdkDir);
  if (!(await fs.pathExists(androidSdkDir))) {
    await fs.ensureDir(androidSdkDir);
    const androidSdkDownloadPath = utils.formatArtifactDownloadPath(ANDROID_SDK_URL);

    try {
      l.info('Downloading Android SDK');
      await fs.ensureDir(config.directories.artifactsDir);
      await download(ANDROID_SDK_URL, androidSdkDownloadPath);
      await fs.ensureDir(androidSdkDir);
      l.info('Decompressing Android SDK');
      await decompress(androidSdkDownloadPath, androidSdkDir);
      await fs.remove(androidSdkDownloadPath);
      l.info('Configuring Android SDK, this may take a while');
      await _configureSdk(androidSdkDir);
      await utils.markDirectoryAsReady(androidSdkDir);
      l.info('Android SDK installed and configured successfully');
    } catch (err) {
      await fs.remove(androidSdkDir);
      throw err;
    } finally {
      await fs.remove(androidSdkDownloadPath);
    }
  }
  return {
    envVars: _createEnvVars(androidSdkDir),
    path: _createPaths(androidSdkDir),
  };
}

async function _configureSdk(androidSdkDir: string) {
  // prevents warnings about missing repo config
  const androidRepositoriesCfgPath = path.join(os.homedir(), '.android/repositories.cfg');
  await fs.ensureFile(androidRepositoriesCfgPath);
  await ExponentTools.spawnAsyncThrowError('./configureAndroidSdk.sh', [], {
    pipeToLogger: true,
    loggerFields: LOGGER_FIELDS,
    cwd: path.join(config.directories.rootDir, 'scripts/android'),
    env: {
      ...process.env,
      ANDROID_HOME: androidSdkDir,
      ANDROID_SDK: androidSdkDir,
    },
  });
}

function _createEnvVars(androidSdkDir: string) {
  return {
    ANDROID_HOME: androidSdkDir,
    ANDROID_SDK: androidSdkDir,
    ANDROID_NDK_HOME: path.join(androidSdkDir, 'ndk/17.2.4988734'),
  };
}

function _createPaths(androidSdkDir: string) {
  return [
    path.join(androidSdkDir, 'platform-tools'),
    path.join(androidSdkDir, 'tools'),
    path.join(androidSdkDir, 'tools/bin'),
    path.join(androidSdkDir, 'build-tools/28.0.3'),
  ];
}
