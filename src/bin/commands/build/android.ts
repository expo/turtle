import fs from 'fs-extra';
import _ from 'lodash';

import { ErrorWithCommandHelp } from 'turtle/bin/commands/ErrorWithCommandHelp';
import { createBuilderAction } from 'turtle/bin/utils/builder';
import builder from 'turtle/builders/android';
import { PLATFORMS } from 'turtle/constants';

export default (program: any, setCommonCommandOptions: any) => {
  const command = program.command('build:android [project-dir]');
  setCommonCommandOptions(command);
  command
    .alias('ba')
    .option(
      '--keystore-path <app.jks>',
      'path to your Keystore (please provide Keystore password and Key password as EXPO_ANDROID_KEYSTORE_PASSWORD'
      + ' and EXPO_ANDROID_KEY_PASSWORD env variables)',
    )
    .option('--keystore-alias <alias>', 'keystore Alias')
    .option(
      '-t --type <build>',
      'type of build: app-bundle|apk',
      /^(app-bundle|apk)$/i,
      'app-bundle',
    )
    .description(
      'Build a standalone APK or App Bundle for your project, signed and ready for submission to the Google Play'
      + ' Store.',
    )
    .asyncAction(
      createBuilderAction({
        program,
        command,
        prepareCredentials,
        builder,
        platform: PLATFORMS.ANDROID,
        os: ['darwin', 'linux'],
      }),
    );
};

const prepareCredentials = async (cmd: any) => {
  const { keystorePath, keystoreAlias } = cmd;
  const keystorePassword = process.env.EXPO_ANDROID_KEYSTORE_PASSWORD;
  const keyPassword = process.env.EXPO_ANDROID_KEY_PASSWORD;

  const someCredentialsExist = keystorePath || keystoreAlias || keystorePassword || keyPassword;
  const credentialsExist = keystorePath && keystoreAlias && keystorePassword && keyPassword;
  if (!credentialsExist) {
    if (someCredentialsExist) {
      throw new ErrorWithCommandHelp(
        'Please provide all required credentials - Keystore (with password), Keystore alias and Key password',
      );
    } else {
      return null;
    }
  } else {
    return {
      keystore: (await fs.readFile(keystorePath)).toString('base64'),
      keystoreAlias,
      keystorePassword,
      keyPassword,
    };
  }
};
