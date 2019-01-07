import _ from 'lodash';
import fs from 'fs-extra';
import uuid from 'uuid';

import builder from 'turtle/builders/android';
import { ErrorWithCommandHelp } from 'turtle/bin/commands/errors';
import { PLATFORMS } from 'turtle/constants';
import { createBuilderAction } from 'turtle/bin/utils/builder';

export default (program: any, setCommonCommandOptions: any) => {
  const command = program.command('build:android [project-dir]');
  setCommonCommandOptions(command);
  command
    .alias('ba')
    .option(
      '--keystore-path <app.jks>',
      'path to your Keystore (please provide Keystore password and Key password as EXPO_ANDROID_KEYSTORE_PASSWORD and EXPO_ANDROID_KEY_PASSWORD env variables)'
    )
    .option('--keystore-alias <alias>', 'keystore Alias')
    .description(
      'Build a standalone APK for your project, signed and ready for submission to the Google Play Store.'
    )
    .asyncAction(
      createBuilderAction({
        program,
        command,
        prepareCredentials,
        buildJobObject,
        builder,
        platform: PLATFORMS.ANDROID,
        os: ['darwin', 'linux'],
      })
    );
};

const buildJobObject = (appJSON: any, { releaseChannel, username, projectDir, publicUrl }: any, credentials: any) => ({
  config: {
    ..._.get(appJSON, 'expo.android.config', {}),
    releaseChannel,
    publicUrl,
  },
  id: uuid.v4(),
  platform: PLATFORMS.ANDROID,
  sdkVersion: _.get(appJSON, 'expo.sdkVersion'),
  projectDir,
  experienceName: `@${username}/${_.get(appJSON, 'expo.slug')}`,
  ...(credentials && { credentials }),
});

const prepareCredentials = async (cmd: any) => {
  const { keystorePath, keystoreAlias } = cmd;
  const keystorePassword = process.env.EXPO_ANDROID_KEYSTORE_PASSWORD;
  const keyPassword = process.env.EXPO_ANDROID_KEY_PASSWORD;

  const someCredentialsExist = keystorePath || keystoreAlias || keystorePassword || keyPassword;
  const credentialsExist = keystorePath && keystoreAlias && keystorePassword && keyPassword;
  if (!credentialsExist) {
    if (someCredentialsExist) {
      throw new ErrorWithCommandHelp(
        'Please provide all required credentials - Keystore (with password), Keystore alias and Key password'
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
