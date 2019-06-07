import fs from 'fs-extra';
import _ from 'lodash';
import uuid from 'uuid';

import { ErrorWithCommandHelp } from 'turtle/bin/commands/ErrorWithCommandHelp';
import { createBuilderAction } from 'turtle/bin/utils/builder';
import builder from 'turtle/builders/ios';
import { IOS_BUILD_TYPES, PLATFORMS } from 'turtle/constants';

export default (program: any, setCommonCommandOptions: any) => {
  const command = program.command('build:ios [project-dir]');
  setCommonCommandOptions(command);
  command
    .alias('bi')
    .option(
      '-t --type <build>',
      'type of build: archive|simulator',
      /^(archive|simulator)$/i,
      'archive',
    )
    .option('--team-id <apple-teamId>', 'Apple Team ID')
    .option(
      '--dist-p12-path <dist.p12>',
      'path to your Distribution Certificate P12 (please provide password as EXPO_IOS_DIST_P12_PASSWORD env variable)',
    )
    .option('--provisioning-profile-path <.mobileprovision>', 'path to your Provisioning Profile')
    .description(
      'Build a standalone IPA for your project, signed and ready for submission to the Apple App Store.',
    )
    .asyncAction(
      createBuilderAction({
        program,
        command,
        prepareCredentials,
        buildJobObject,
        builder,
        platform: PLATFORMS.IOS,
        os: 'darwin',
      }),
    );
};

const buildJobObject = (appJSON: any, { releaseChannel, buildType, username, publicUrl }: any, credentials: any) => ({
  config: {
    ..._.get(appJSON, 'expo.ios.config', {}),
    buildType,
    releaseChannel,
    bundleIdentifier: _.get(appJSON, 'expo.ios.bundleIdentifier'),
    publicUrl,
  },
  id: uuid.v4(),
  platform: PLATFORMS.IOS,
  sdkVersion: _.get(appJSON, 'expo.sdkVersion'),
  experienceName: `@${username}/${_.get(appJSON, 'expo.slug')}`,
  ...(credentials && { credentials }),
});

const prepareCredentials = async (cmd: any) => {
  if (cmd.type !== IOS_BUILD_TYPES.ARCHIVE) {
    return null;
  }

  const { teamId, distP12Path, provisioningProfilePath } = cmd;
  const certPassword = process.env.EXPO_IOS_DIST_P12_PASSWORD;

  const credentialsExist =
    teamId && distP12Path && certPassword && provisioningProfilePath;

  if (!credentialsExist) {
    throw new ErrorWithCommandHelp(
      'Please provide all required credentials'
      + '- Apple Team ID, Distribution Certificate P12 (with password) and Provisioning Profile',
    );
  }

  return {
    teamId,
    certP12: (await fs.readFile(distP12Path)).toString('base64'),
    certPassword,
    provisioningProfile: (await fs.readFile(provisioningProfilePath)).toString('base64'),
  };
};
