import _ from 'lodash';

import { ErrorWithCommandHelp } from 'turtle/bin/commands/ErrorWithCommandHelp';
import { ErrorWithProgramHelp } from 'turtle/bin/commands/ErrorWithProgramHelp';
import setup from 'turtle/bin/setup/setup';
import { PLATFORMS } from 'turtle/constants';
import logger from 'turtle/logger';

const l = logger.withFields({ buildPhase: 'setting up environment' });

function createSetupCommand(platform: string, os?: string) {
  return (program: any) => {
    const command = program.command(`setup:${platform}`);
    const platformFirstLetter = platform[0];
    command
      .alias(`s${platformFirstLetter}`)
      .description(`Setup environment for building ${_.capitalize(platform)} standalone apps.`)
      .option(
        '--sdk-version <sdk-version>',
        'version of Expo SDK shell app to download (optional)',
      )
      .asyncAction(async (cmd: any) => await setupAction(program, cmd, platform, os));
  };
}

async function setupAction(program: any, cmd: any, platform: string, os?: string) {
  try {
    if (os && process.platform !== os) {
      throw new Error('We don\'t support running standalone app builds for this platform on your operating system');
    }

    const { sdkVersion } = cmd;
    await setup(platform, sdkVersion);
    l.info('it\'s all set!');
  } catch (err) {
    logger.error(`Failed to setup environment for ${platform} builds`);
    logger.error(err.stack);
    if (err instanceof ErrorWithCommandHelp) {
      cmd.help();
    } else if (err instanceof ErrorWithProgramHelp) {
      program.help();
    }
    process.exit(1);
  }
}

export default {
  ios: createSetupCommand(PLATFORMS.IOS, 'darwin'),
  android: createSetupCommand(PLATFORMS.ANDROID),
};
