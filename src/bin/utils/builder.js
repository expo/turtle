import logger from 'turtle/logger';
import { sanitizeJob } from 'turtle/validator';
import * as UserUtils from 'turtle/bin/utils/user';
import * as ProjectUtils from 'turtle/bin/utils/project';
import { ErrorWithCommandHelp, ErrorWithProgramHelp } from 'turtle/bin/commands/errors';

export function createBuilderAction({
  program,
  command,
  prepareCredentials,
  buildJobObject,
  builder,
}) {
  return async (projectDirArg, cmd) => {
    try {
      const userData = {
        username: cmd.parent.username || process.env.EXPO_USERNAME,
        password: cmd.parent.password || process.env.EXPO_PASSWORD,
      };

      const args = {
        releaseChannel: cmd.releaseChannel,
        buildType: cmd.type,
        username: userData.username,
        projectDir: ProjectUtils.resolveProjectDir(projectDirArg),
      };
      await UserUtils.ensureUserLoggedIn(userData);

      const appJSON = await ProjectUtils.loadAppJSON(projectDirArg);
      const credentials = await prepareCredentials(cmd);
      const rawJob = buildJobObject(appJSON, args, credentials);
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
    }
  };
}
