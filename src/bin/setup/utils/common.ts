import path from 'path';

import { ExponentTools } from '@expo/xdl';
import fs from 'fs-extra';
import tar from 'tar';

import download from 'turtle/bin/setup/utils/downloader';
import { ensureToolsAreInstalled, IToolDefinition } from 'turtle/bin/setup/utils/toolsDetector';
import { IShellAppDirectoryConfig } from 'turtle/builders/utils/workingdir';
import config from 'turtle/config';
import logger from 'turtle/logger';

const l = logger.child({ buildPhase: 'setting up environment' });

interface IShellAppFormaters {
  formatShellAppDirectory: (config: IShellAppDirectoryConfig) => string;
  formatShellAppTarballUriPath: (sdkMajorVersion: string) => string;
}

type PostDownloadAction = (sdkVersion: string, workingdir: string) => Promise<void>;

export async function checkSystem(requiredTools: IToolDefinition[]) {
  await ensureToolsAreInstalled(requiredTools);
}

export async function ensureShellAppIsPresent(
  sdkVersion: string,
  formatters: IShellAppFormaters,
  postDownloadAction?: PostDownloadAction,
) {
  const workingdir = formatters.formatShellAppDirectory({ sdkVersion });
  const shellAppMetadata = await _readShellAppTarballS3Uri(sdkVersion, formatters);
  await removeDirectoryUnlessReady(workingdir, { metadata: shellAppMetadata });
  if (await fs.pathExists(workingdir)) {
    return;
  }
  l.info(`shell app for SDK ${sdkVersion} doesn't exist, downloading...`);
  await _downloadShellApp(sdkVersion, workingdir, formatters);
  if (postDownloadAction) {
    await postDownloadAction(sdkVersion, workingdir);
  }
  await markDirectoryAsReady(workingdir, { metadata: shellAppMetadata });
}

async function _downloadShellApp(sdkVersion: string, targetDirectory: string, formatters: IShellAppFormaters) {
  const shellAppTarballS3Uri = await _readShellAppTarballS3Uri(sdkVersion, formatters);
  const tarballDownloadTargetPath = formatArtifactDownloadPath(shellAppTarballS3Uri);
  await fs.ensureDir(config.directories.artifactsDir);
  await download(shellAppTarballS3Uri, tarballDownloadTargetPath);
  l.info('shell app has been downloaded');
  await fs.ensureDir(targetDirectory);
  l.info('extracting shell app (this may take a while)...');
  await tar.x({
    file: tarballDownloadTargetPath,
    C: targetDirectory,
  });
  l.info('shell app extracted');
}

export function formatArtifactDownloadPath(uri: string) {
  const { base } = path.parse(uri);
  return path.join(config.directories.artifactsDir, base);
}

async function _readShellAppTarballS3Uri(sdkVersion: string, formatters: IShellAppFormaters) {
  const sdkMajorVersion = ExponentTools.parseSdkMajorVersion(sdkVersion);
  const filePath = formatters.formatShellAppTarballUriPath(sdkMajorVersion);
  const data = await fs.readFile(filePath, 'utf8');
  return data.trim();
}

export async function removeDirectoryUnlessReady(
  dir: string,
  { metadata, readyFileName }: { metadata?: string, readyFileName?: string },
) {
  const readyFilePath = path.join(dir, readyFileName ?? '.ready');
  const readyFileExists = await fs.pathExists(readyFilePath);
  let shouldRemove = false;
  if (readyFileExists) {
    if (metadata !== undefined) {
      const readyFileContents = (await fs.readFile(readyFilePath, 'utf-8')).trim();
      if (readyFileContents !== metadata) {
        shouldRemove = true;
      }
    }
  } else {
    shouldRemove = true;
  }
  if (shouldRemove) {
    await fs.remove(dir);
  }
}

export async function markDirectoryAsReady(
  dir: string,
  { metadata, readyFileName }: { metadata?: string, readyFileName?: string },
) {
  const readyFilePath = path.join(dir, readyFileName ?? '.ready');
  if (metadata === undefined) {
    await fs.open(readyFilePath, 'w');
  } else {
    await fs.writeFile(readyFilePath, metadata);
  }
}
