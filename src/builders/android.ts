import path from 'path';

import { AndroidShellApp, ImageUtils } from '@expo/xdl';
import fs from 'fs-extra';
import _ from 'lodash';
import { ANDROID_BUILD_TYPES } from 'turtle/constants';
import uuidv4 from 'uuid/v4';

import getOrCreateCredentials from 'turtle/builders/utils/android/credentials';
import { formatShellAppDirectory } from 'turtle/builders/utils/android/workingdir';
import * as commonUtils from 'turtle/builders/utils/common';
import * as imageHelpers from 'turtle/builders/utils/image';
import { resolveExplicitOptIn, resolveNativeModules } from 'turtle/builders/utils/unimodules';
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
  const fakeUploadFilename = s3Filename.replace('/', '__');

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

  // Default behaviour:
  // - load all modules except [expo-branch]
  // - load expo-branch only if present in package.json dependencies
  //
  // Behaviour with "enableDangerousExperimentalLeanBuilds" flag enabled
  // - add unimodules from `manifest.dependencies` (project package.json dependecies)
  // - add unimodules from react-native-unimodules package.json
  // - add unimodules from expo package package.json
  // - add recusively all dependecies of already added unimodules
  logger.info({ buildPhase: 'resolve native modules' }, 'Resolving universal modules dependencies');
  const packageJsonDependecies = _.get(manifest, 'dependencies');
  const enabledModules = _.get(manifest, 'android.enableDangerousExperimentalLeanBuilds')
    ? await resolveNativeModules(workingDir, packageJsonDependecies)
    : await resolveExplicitOptIn(workingDir, packageJsonDependecies);

  try {
    await AndroidShellApp.createAndroidShellAppAsync({
      url: commonUtils.getExperienceUrl(jobData.experienceName, jobData.config.publicUrl),
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
      buildMode: jobData.config.buildMode,
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
