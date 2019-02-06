import * as path from 'path';

import { v4 as uuidv4 } from 'uuid';
import { IosShellApp } from 'xdl';

import { formatShellAppDirectory } from 'turtle/builders/utils/ios/workingdir';
import config from 'turtle/config';
import { IOS, PLATFORMS } from 'turtle/constants/index';
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
  workingDir: string;
  workspacePath: string;
  applicationFilesSrc: string;
}

const { EXPOKIT_APP, EXPONENT_APP } = IosShellApp;
const { BUILD_TYPES } = IOS;

export function createBuilderContext(job: IJob): IContext {
  const { join } = path;
  const appUUID = uuidv4();
  const {
    manifest: {
      sdkVersion: sdkVersionFromManifest = null,
    } = {},
    sdkVersion: sdkVersionFromJob,
    config: { buildType },
  } = job;

  const sdkVersion = sdkVersionFromJob || sdkVersionFromManifest;
  const workingDir = formatShellAppDirectory({ sdkVersion, buildType: buildType! });

  const context: any = {
    appDir: join(config.directories.temporaryFilesRoot, appUUID),
    appUUID,
    workingDir,
  };
  context.buildDir = join(context.appDir, 'build');
  context.provisioningProfileDir = join(context.appDir, 'provisioning');
  context.provisioningProfilePath = join(
    context.provisioningProfileDir,
    `${appUUID}.mobileprovision`,
  );
  context.tempCertPath = join(context.appDir, 'cert.p12');
  context.baseArchiveDir = join(context.appDir, 'archive');

  if (buildType === BUILD_TYPES.CLIENT) {
    context.applicationFilesSrc = join(
      workingDir,
      'iphone-build',
      '**',
      '*',
    );
  } else {
    context.applicationFilesSrc = join(
      workingDir,
      'shellAppBase-builds',
      buildType as string,
      '**',
      '*',
    );
  }

  if (buildType === BUILD_TYPES.ARCHIVE) {
    context.outputPath = join(context.appDir, 'archive.xcarchive');
    context.uploadPath = join(context.buildDir, 'archive.ipa');
    context.archiveDir = join(
      context.baseArchiveDir,
      'Release',
      `${EXPOKIT_APP}.xcarchive`,
      'Products',
      'Applications',
      `${EXPOKIT_APP}.app`,
    );
    context.workspacePath = path.join(
      workingDir,
      'shellAppWorkspaces',
      'ios',
      'default',
      `${EXPOKIT_APP}.xcworkspace`,
    );
  } else if (buildType === BUILD_TYPES.CLIENT) {
    context.outputPath = join(context.appDir, 'archive.xcarchive');
    context.uploadPath = join(context.buildDir, 'archive.ipa');
    context.archiveDir = join(
      context.baseArchiveDir,
      `${EXPONENT_APP}.xcarchive`,
      'Products',
      'Applications',
      `${EXPONENT_APP}.app`,
    );
    context.workspacePath = path.join(
      workingDir,
      'ios',
      `${EXPONENT_APP}.xcworkspace`,
    );
  } else if (buildType === BUILD_TYPES.SIMULATOR) {
    context.outputPath = join(context.appDir, 'archive.tar.gz');
    context.uploadPath = join(context.appDir, 'archive.tar.gz');
    context.archiveDir = join(
      context.baseArchiveDir,
      'Release',
      `${EXPOKIT_APP}.app`,
    );
  }

  const s3FileExtension = buildType === BUILD_TYPES.SIMULATOR ? 'tar.gz' : 'ipa';
  const s3Filename = `${job.experienceName}-${appUUID}-${buildType}.${s3FileExtension}`;
  if (config.builder.fakeUpload) {
    const fakeUploadFilename = s3Filename.replace('/', '\\');
    context.fakeUploadBuildPath = job.fakeUploadBuildPath
      ? job.fakeUploadBuildPath
      : join(job.fakeUploadDir || config.directories.fakeUploadDir, fakeUploadFilename);
  } else {
    context.s3FileKey = join(PLATFORMS.IOS, s3Filename);
  }

  return context;
}
