import path from 'path';

import fs from 'fs-extra';
import _ from 'lodash';
import uuidv4 from 'uuid/v4';
import { AndroidShellApp, ImageUtils } from 'xdl';

import getOrCreateCredentials from 'turtle/builders/utils/android/credentials';
import { formatShellAppDirectory } from 'turtle/builders/utils/android/workingdir';
import * as commonUtils from 'turtle/builders/utils/common';
import * as imageHelpers from 'turtle/builders/utils/image';
import { uploadBuildToS3 } from 'turtle/builders/utils/uploader';
import config from 'turtle/config';
import { IAndroidCredentials, IJob, IJobResult } from 'turtle/job';
import logger from 'turtle/logger';

export default async function buildAndroid(jobData: IJob): Promise<IJobResult> {
  const credentials = await getOrCreateCredentials(jobData);
  const apkFilePath = await runShellAppBuilder(jobData, credentials);
  const randomHex = uuidv4().replace(/-/g, '');
  const s3Filename = `${jobData.experienceName}-${randomHex}-signed.apk`;
  const s3FileKey = `android/${s3Filename}`;
  const fakeUploadFilename = s3Filename.replace('/', '\\');
  const artifactUrl = await uploadBuildToS3({
    uploadPath: apkFilePath,
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

  const outputFilePath = path.join(temporaryFilesRoot, `shell-signed-${jobData.id}.apk`);

  const { config: jobConfig, manifest, sdkVersion: sdkVersionFromJob } = jobData;
  const sdkVersion = _.get(manifest, 'sdkVersion', sdkVersionFromJob);
  const workingDir = formatShellAppDirectory({ sdkVersion });

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
