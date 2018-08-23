import * as path from 'path';

import { v4 as uuidv4 } from 'uuid';
import { IosShellApp } from 'xdl';

import config from 'turtle/config';
import { IOS } from 'turtle/constants/index';
import { IJob } from 'turtle/job';

export interface IContext {
  appDir: string;
  appUUID: string;
  archiveDir: string;
  baseArchiveDir: string;
  buildDir: string;
  fakeUploadBuildPath?: string;
  outputPath: string;
  provisioningProfilePath: string;
  provisioningProfileDir: string;
  s3FileKey?: string;
  tempCertPath: string;
  uploadPath: string;
}

const { DEFAULT_EXPOKIT_WORKSPACE_NAME } = IosShellApp;
const { BUILD_TYPES } = IOS;

export function createBuilderContext(job: IJob): IContext {
  const { join } = path;
  const appUUID = uuidv4();
  const { buildType } = job.config;

  const context: any = {
    appDir: join(config.builder.temporaryFilesRoot, appUUID),
    appUUID,
  };
  context.buildDir = join(context.appDir, 'build');
  context.provisioningProfileDir = join(context.appDir, 'provisioning');
  context.provisioningProfilePath = join(
    context.provisioningProfileDir,
    `${appUUID}.mobileprovision`
  );
  context.tempCertPath = join(context.appDir, 'cert.p12');
  context.baseArchiveDir = join(context.appDir, 'archive');

  if (buildType === BUILD_TYPES.SIMULATOR) {
    context.outputPath = join(context.appDir, 'archive.tar.gz');
    context.uploadPath = join(context.appDir, 'archive.tar.gz');
    context.archiveDir = join(
      context.baseArchiveDir,
      'Release',
      `${DEFAULT_EXPOKIT_WORKSPACE_NAME}.app`
    );
  } else if (buildType === BUILD_TYPES.ARCHIVE) {
    context.outputPath = join(context.appDir, 'archive.xcarchive');
    context.uploadPath = join(context.buildDir, 'archive.ipa');
    context.archiveDir = join(
      context.baseArchiveDir,
      'Release',
      `${DEFAULT_EXPOKIT_WORKSPACE_NAME}.xcarchive`,
      'Products',
      'Applications',
      `${DEFAULT_EXPOKIT_WORKSPACE_NAME}.app`
    );
  }

  const s3FileExtension = buildType === BUILD_TYPES.SIMULATOR ? 'tar.gz' : 'ipa';
  const s3Filename = `${job.experienceName}-${appUUID}-${buildType}.${s3FileExtension}`;
  if (config.builder.fakeUpload) {
    const fakeUploadFilename = s3Filename.replace('/', '\\');
    context.fakeUploadBuildPath = join(config.builder.fakeUploadDir, fakeUploadFilename);
  } else {
    context.s3FileKey = join('ios', s3Filename);
  }

  return context;
}
