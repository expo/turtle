import _ from 'lodash';

import logger from 'turtle/logger';
import { sanitizeJob } from 'turtle/validator';
import * as UserUtils from 'turtle/bin/utils/user';
import * as ProjectUtils from 'turtle/bin/utils/project';
import { ErrorWithCommandHelp, ErrorWithProgramHelp } from 'turtle/bin/commands/errors';
import setup from 'turtle/bin/setup/setup';

export function createBuilderAction({
  program,
  command,
  prepareCredentials,
  buildJobObject,
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
        throw new ErrorWithCommandHelp('You can\'t provide both --build-dir and --output parameters, please choose one');
      }

      const userData = {
        username: cmd.username || process.env.EXPO_USERNAME,
        password: cmd.password || process.env.EXPO_PASSWORD,
      };

      if (!(userData.username && userData.password)) {
        throw new ErrorWithCommandHelp('You must provide your Expo username and password');
      }
      await UserUtils.ensureUserLoggedIn(userData);

      const args = {
        releaseChannel: cmd.releaseChannel || 'default',
        buildType: cmd.type,
        username: userData.username,
        projectDir: ProjectUtils.resolveAbsoluteDir(projectDirArg),
        publicUrl: cmd.publicUrl,
      };

      const appJSON = await ProjectUtils.loadAppJSON(projectDirArg);
      const sdkVersion = _.get(appJSON, 'expo.sdkVersion');
      await setup(platform, sdkVersion);
      const credentials = await prepareCredentials(cmd);
      const rawJob = {
        ...buildJobObject(appJSON, args, credentials),
        ...cmd.buildDir && { fakeUploadDir: ProjectUtils.resolveAbsoluteDir(cmd.buildDir) },
        ...cmd.output && { fakeUploadBuildPath: ProjectUtils.resolveAbsoluteDir(cmd.output) },
      };
      const job = await sanitizeJob(rawJob);
      await builder(job);
    } catch (err) {
      logger.error(`Failed to build standalone app: ${err.message}`);
      logger.error(err.stack);
      if (err instanceof ErrorWithCommandHelp) {
        command.help();
      } else if (err instanceof ErrorWithProgramHelp) {
        program.help();
      }
      process.exit(1);
    }
  };
}
