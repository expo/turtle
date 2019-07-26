import { ExponentTools } from '@expo/xdl';
import _ from 'lodash';
import uuid from 'uuid';

import { ErrorWithCommandHelp } from 'turtle/bin/commands/ErrorWithCommandHelp';
import { ErrorWithProgramHelp } from 'turtle/bin/commands/ErrorWithProgramHelp';
import setup from 'turtle/bin/setup/setup';
import * as ProjectUtils from 'turtle/bin/utils/project';
import * as UserUtils from 'turtle/bin/utils/user';
import { getExperienceUrl } from 'turtle/builders/utils/common';
import logger from 'turtle/logger';
import { sanitizeJob } from 'turtle/validator';

export function createBuilderAction({
  program,
  command,
  prepareCredentials,
  builder,
  platform,
  os,
}: any) {
  return async (projectDirArg: string, cmd: any) => {
    try {
      const osList = [];
      if (Array.isArray(os)) {
        osList.push(...os);
      } else {
        osList.push(os);
      }
      if (osList.length && !osList.includes(process.platform)) {
        throw new Error('We don\'t support running standalone app builds for this platform on your operating system');
      }

      if (cmd.buildDir && cmd.output) {
        throw new ErrorWithCommandHelp(
          'You can\'t provide both --build-dir and --output parameters, please choose one',
        );
      }

      const userData = {
        username: cmd.username || process.env.EXPO_USERNAME,
        password: cmd.password || process.env.EXPO_PASSWORD,
      };

      if (userData.username || userData.password) {
        if (userData.username && userData.password) {
          await UserUtils.ensureUserLoggedIn(userData);
        } else {
          throw new ErrorWithCommandHelp('You must provide both Expo username and password');
        }
      } else if (!cmd.publicUrl) {
        throw new ErrorWithCommandHelp(
          'You must provide your Expo username and password unless you specify --public-url to your project manifest.',
        );
      }

      const args = {
        releaseChannel: cmd.releaseChannel || 'default',
        buildType: cmd.type,
        buildMode: cmd.mode,
        username: userData.username || 'anonymous',
        projectDir: ProjectUtils.resolveAbsoluteDir(projectDirArg),
        publicUrl: cmd.publicUrl,
      };

      const appJSON = await ProjectUtils.loadAppJSON(projectDirArg, cmd.config);
      const sdkVersion = _.get(appJSON, 'expo.sdkVersion');
      await setup(platform, sdkVersion);
      const credentials = await prepareCredentials(cmd);
      const rawJob = {
        ...await buildJobObject(platform, appJSON, args, credentials),
        ...cmd.buildDir && { fakeUploadDir: ProjectUtils.resolveAbsoluteDir(cmd.buildDir) },
        ...cmd.output && { fakeUploadBuildPath: ProjectUtils.resolveAbsoluteDir(cmd.output) },
      };
      const job = await sanitizeJob(rawJob);
      await builder(job);
    } catch (err) {
      logger.error({ err }, 'Failed to build standalone app');
      if (err instanceof ErrorWithCommandHelp) {
        command.help();
      } else if (err instanceof ErrorWithProgramHelp) {
        program.help();
      }
      process.exit(1);
    }
  };
}

const buildJobObject = async (
  platform: 'android' | 'ios',
  appJSON: any,
  { releaseChannel, buildType, buildMode, username, publicUrl, projectDir }: any,
  credentials: any,
) => {
  const job = {
    config: {
      ..._.get(appJSON, `expo.${platform}.config`, {}),
      buildType,
      ...(platform === 'android' ? { buildMode } : {}),
      releaseChannel,
      ...(platform === 'ios' ? { bundleIdentifier: _.get(appJSON, 'expo.ios.bundleIdentifier') } : {}),
      ...(platform === 'android' ? { androidPackage: _.get(appJSON, 'expo.android.package') } : {}),
      publicUrl,
    },
    id: uuid.v4(),
    platform,
    projectDir,
    sdkVersion: _.get(appJSON, 'expo.sdkVersion'),
    experienceName: `@${username}/${_.get(appJSON, 'expo.slug')}`,
    ...(credentials && { credentials }),
  };
  const url = getExperienceUrl(job.experienceName, job.config.publicUrl);

  const manifest = await ExponentTools.getManifestAsync(url, {
    'Exponent-SDK-Version': _.get(appJSON, 'expo.sdkVersion'),
    'Exponent-Platform': platform,
    'Expo-Release-Channel': releaseChannel,
    'Accept': 'application/expo+json,application/json',
  });

  return { ...job, manifest };
};
