import path from 'path';

import { AndroidShellApp, ImageUtils } from '@expo/xdl';
import fs from 'fs-extra';
import _ from 'lodash';
import semver from 'semver';
import { ANDROID_BUILD_TYPES } from 'turtle/constants';
import uuidv4 from 'uuid/v4';

import getOrCreateCredentials from 'turtle/builders/utils/android/credentials';
import { formatShellAppDirectory } from 'turtle/builders/utils/android/workingdir';
import * as commonUtils from 'turtle/builders/utils/common';
import * as imageHelpers from 'turtle/builders/utils/image';
import { resolveNativeModules } from 'turtle/builders/utils/unimodules';
import { uploadBuildToS3 } from 'turtle/builders/utils/uploader';
import { ensureCanBuildSdkVersion } from 'turtle/builders/utils/version';
import config from 'turtle/config';
import { IAndroidCredentials, IJob, IJobResult } from 'turtle/job';
import logger from 'turtle/logger';

export default async function buildAndroid(jobData: IJob): Promise<IJobResult> {
  await ensureCanBuildSdkVersion(jobData);
  const credentials = await getOrCreateCredentials(jobData);
  const outputFilePath = await runShellAppBuilder(jobData, credentials);

  const randomHex = uuidv4().replace(/-/g, '');
  const s3FileExtension = jobData.config.buildType === ANDROID_BUILD_TYPES.APP_BUNDLE ? 'aab' : 'apk';
  const s3Filename = `${jobData.experienceName}-${randomHex}-signed.${s3FileExtension}`;
  const s3FileKey = `android/${s3Filename}`;
  const fakeUploadFilename = s3Filename.replace('/', '\\');

  const artifactUrl = await uploadBuildToS3({
    uploadPath: outputFilePath,
    s3FileKey,
    ...config.builder.fakeUpload && {
      fakeUploadBuildPath:
        jobData.fakeUploadBuildPath
        ? jobData.fakeUploadBuildPath
        : path.join(jobData.fakeUploadDir || config.directories.fakeUploadDir, fakeUploadFilename),
    },
  });

  return { artifactUrl };
}

async function runShellAppBuilder(
  jobData: IJob,
  credentials: IAndroidCredentials,
): Promise<string> {
  const { temporaryFilesRoot } = config.directories;
  await fs.ensureDir(temporaryFilesRoot);
  const tempShellAppConfigPath = path.join(temporaryFilesRoot, `app-config-${jobData.id}.json`);
  const tempKeystorePath = path.join(temporaryFilesRoot, `keystore-${jobData.id}.jks`);
  const configJSON = JSON.stringify(jobData.config);
  await fs.writeFile(tempShellAppConfigPath, configJSON, { mode: 0o644 });
  await fs.writeFile(tempKeystorePath, Buffer.from(credentials.keystore, 'base64'), {
    mode: 0o600,
  });

  logger.info({ buildPhase: 'starting builder' }, 'Starting build process');

  logger.info(
    { buildPhase: 'icons setup' },
    'ImageUtils: setting image functions to alternative sharp implementations',
  );
  ImageUtils.setResizeImageFunction(imageHelpers.resizeIconWithSharpAsync);
  ImageUtils.setGetImageDimensionsFunction(imageHelpers.getImageDimensionsWithSharpAsync);

  const fileExtension = jobData.config.buildType === ANDROID_BUILD_TYPES.APP_BUNDLE ? 'aab' : 'apk';
  const outputFilePath = path.join(temporaryFilesRoot, `shell-signed-${jobData.id}.${fileExtension}`);

  const { config: jobConfig, manifest, sdkVersion: sdkVersionFromJob } = jobData;
  const sdkVersion = _.get(manifest, 'sdkVersion', sdkVersionFromJob);
  const workingDir = formatShellAppDirectory({ sdkVersion });

  logger.info({ buildPhase: 'resolve native modules' }, 'Resolving universal modules dependencies');
  const enabledModules = semver.satisfies(sdkVersion, '>= 33.0.0')
    ? await resolveNativeModules(workingDir, manifest && manifest.dependencies)
    : null;

  try {
    await AndroidShellApp.createAndroidShellAppAsync({
      url: commonUtils.getExperienceUrl(jobData),
      sdkVersion,
      keystore: tempKeystorePath,
      manifest,
      alias: credentials.keystoreAlias,
      keystorePassword: credentials.keystorePassword,
      keyPassword: credentials.keyPassword,
      privateConfigFile: tempShellAppConfigPath,
      releaseChannel: jobConfig.releaseChannel,
      workingDir,
      outputFile: outputFilePath,
      modules: enabledModules,
      buildType: jobData.config.buildType,
    });
  } catch (err) {
    commonUtils.logErrorOnce(err);
    throw err;
  } finally {
    if (!config.builder.skipCleanup) {
      await fs.unlink(tempShellAppConfigPath);
      await fs.unlink(tempKeystorePath);
    }
  }

  return outputFilePath;
}
