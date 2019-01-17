import os from 'os';
import path from 'path';

import decompress from 'decompress';
import fs from 'fs-extra';

import { formatArtifactDownloadPath } from 'turtle/bin/setup/utils/common';
import download from 'turtle/bin/setup/utils/downloader';
import config from 'turtle/config';
import logger from 'turtle/logger';

const ANDROID_NDK_URL = `https://dl.google.com/android/repository/android-ndk-r10e-${os.platform()}-x86_64.zip`;

const LOGGER_FIELDS = { buildPhase: 'setting up environment' };
const l = logger.withFields(LOGGER_FIELDS);

export default async function ensureAndroidNDKIsPresent() {
  const androidNdkDir = path.join(config.directories.androidDependenciesDir, 'ndk');
  if (!(await fs.pathExists(androidNdkDir))) {
    await fs.ensureDir(androidNdkDir);
    const androidNdkDownloadPath = formatArtifactDownloadPath(ANDROID_NDK_URL);

    try {
      l.info('Downloading Android NDK');
      await fs.ensureDir(config.directories.artifactsDir);
      await download(ANDROID_NDK_URL, androidNdkDownloadPath);
      l.info('Decompressing Android NDK');
      await decompress(androidNdkDownloadPath, androidNdkDir, { strip: 1 });
      l.info('Android NDK installed successfully');
    } catch (err) {
      await fs.remove(androidNdkDir);
      throw err;
    } finally {
      await fs.remove(androidNdkDownloadPath);
    }
  }
  return {
    envVars: _createEnvVars(androidNdkDir),
    path: _createPaths(androidNdkDir),
  };
}

function _createEnvVars(androidNdkDir: string) {
  return {
    ANDROID_NDK: androidNdkDir,
  };
}

function _createPaths(androidNdkDir: string) {
  return [androidNdkDir];
}
