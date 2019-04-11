import path from 'path';

import fs from 'fs-extra';
import tar from 'tar';
import { ExponentTools } from 'xdl';

import download from 'turtle/bin/setup/utils/downloader';
import { ensureToolsAreInstalled, IToolDefinition } from 'turtle/bin/setup/utils/toolsDetector';
import { IShellAppDirectoryConfig } from 'turtle/builders/utils/workingdir';
import config from 'turtle/config';

interface IShellAppFormaters {
  formatShellAppDirectory: (config: IShellAppDirectoryConfig) => string;
  formatShellAppTarballUriPath: (sdkMajorVersion: string) => string;
}

type PostDownloadAction = (workingdir: string, logger: any) => void;

export async function checkSystem(requiredTools: IToolDefinition[], logger: any) {
  await ensureToolsAreInstalled(requiredTools, logger);
}

export async function ensureShellAppIsPresent(
  sdkVersion: string,
  formatters: IShellAppFormaters,
  logger: any,
  postDownloadAction?: PostDownloadAction,
) {
  const workingdir = formatters.formatShellAppDirectory({ sdkVersion });
  const l = logger.child({ buildPhase: 'setting up environment' });
  if (await fs.pathExists(workingdir)) {
    return;
  }
  l.info(`shell app for SDK ${sdkVersion} doesn't exist, downloading...`);
  await _downloadShellApp(sdkVersion, workingdir, formatters, l);
  if (postDownloadAction) {
    await postDownloadAction(workingdir, logger);
  }
}

async function _downloadShellApp(
  sdkVersion: string,
  targetDirectory: string,
  formatters: IShellAppFormaters,
  logger: any,
) {
  const shellAppTarballS3Uri = await _readShellAppTarballS3Uri(sdkVersion, formatters);
  const tarballDownloadTargetPath = formatArtifactDownloadPath(shellAppTarballS3Uri);
  await fs.ensureDir(config.directories.artifactsDir);
  await download(shellAppTarballS3Uri, tarballDownloadTargetPath);
  logger.info('shell app has been downloaded');
  await fs.ensureDir(targetDirectory);
  logger.info('extracting shell app (this may take a while)...');
  await tar.x({
    file: tarballDownloadTargetPath,
    C: targetDirectory,
  });
  logger.info('shell app extracted');
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
