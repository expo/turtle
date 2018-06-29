import _ from 'lodash';
import uuid from 'uuid';
import fs from 'fs-extra';
import builder from 'turtle/builders/ios';

import { ErrorWithCommandHelp } from 'turtle/bin/commands/errors';
import { PLATFORMS, IOS } from 'turtle/constants';
import { createBuilderAction } from 'turtle/bin/utils/builder';

export default program => {
  const command = program.command('build:ios [project-dir]');
  command
    .alias('bi')
    .option(
      '-t --type <build>',
      'type of build: archive|simulator',
      /^(archive|simulator)$/i,
      'archive'
    )
    .option('--release-channel <channel-name>', 'pull from specified release channel', 'default')
    .option('--team-id <apple-teamId>', 'Apple Team ID')
    .option(
      '--dist-p12-path <dist.p12>',
      'path to your Distribution Certificate P12 (please provide password as EXPO_IOS_DIST_P12_PASSWORD env variable)'
    )
    .option(
      '--push-p12-path <push.p12>',
      'path to your Push Notification Certificate P12 (please provide password as EXPO_IOS_PUSH_P12_PASSWORD env variable)'
    )
    .option('--provisioning-profile-path <.mobileprovision>', 'path to your Provisioning Profile')
    .description(
      'Build a standalone IPA for your project, signed and ready for submission to the Apple App Store.'
    )
    .action(
      createBuilderAction({
        program,
        command,
        prepareCredentials,
        buildJobObject,
        builder,
      })
    );
};

const buildJobObject = (appJSON, { releaseChannel, buildType, username }, credentials) => ({
  config: {
    buildType,
    releaseChannel,
    bundleIdentifier: _.get(appJSON, 'expo.ios.bundleIdentifier'),
  },
  id: uuid.v4(),
  platform: PLATFORMS.IOS,
  experience: {
    sdkVersion: _.get(appJSON, 'expo.sdkVersion'),
  },
  experienceName: `@${username}/${_.get(appJSON, 'expo.slug')}`,
  ...(credentials && { credentials }),
});

const prepareCredentials = async cmd => {
  if (cmd.type !== IOS.BUILD_TYPES.ARCHIVE) {
    return null;
  }

  const { teamId, distP12Path, pushP12Path, provisioningProfilePath } = cmd;
  const certPassword = process.env.EXPO_IOS_DIST_P12_PASSWORD;
  const pushPassword = process.env.EXPO_IOS_PUSH_P12_PASSWORD;

  const credentialsExist =
    teamId && distP12Path && certPassword && pushP12Path && pushPassword && provisioningProfilePath;

  if (!credentialsExist) {
    throw new ErrorWithCommandHelp(
      'Please provide all required credentials - Apple Team ID, Distribution Certificate P12 (with password), Push Notification Certificate P12 (with password) and Provisioning Profile'
    );
  }

  return {
    teamId,
    certP12: (await fs.readFile(distP12Path)).toString('base64'),
    certPassword,
    pushP12: (await fs.readFile(pushP12Path)).toString('base64'),
    pushPassword,
    provisioningProfile: (await fs.readFile(provisioningProfilePath)).toString('base64'),
  };
};
