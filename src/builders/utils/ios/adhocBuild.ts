import path from 'path';

import spawnAsync from '@expo/spawn-async';
import fs from 'fs-extra';
import isEmpty from 'lodash/isEmpty';
import { IosCodeSigning } from 'xdl';

import * as sqs from 'turtle/aws/sqs';
import BuildError, { BuildErrorReason } from 'turtle/builders/BuildError';
import { UPDATE_CREDENTIALS } from 'turtle/constants/build';
import { IJob } from 'turtle/job';
import { isOffline } from 'turtle/turtleContext';

// tslint:disable-next-line:no-var-requires
const travelingFastlane = process.platform === 'darwin' ? require('@expo/traveling-fastlane-darwin')() : null;

async function prepareAdHocBuildCredentials(job: IJob, logger: any) {
  if (process.platform !== 'darwin') {
    throw new Error('This function should be called only on macOS!');
  }

  const { bundleIdentifier } = job.config;
  const { certP12, certPassword, teamId, appleSession, udids } = job.credentials;

  const certSerialNumber = IosCodeSigning.findP12CertSerialNumber(certP12, certPassword);
  const args = [
    teamId,
    udids!.join(','),
    bundleIdentifier,
    certSerialNumber || '__last__',
  ];

  try {
    const credentials = await runFastlaneAction(
      travelingFastlane.manageAdHocProvisioningProfile,
      args,
      { env: { FASTLANE_SESSION: appleSession } },
    );
    if (isEmpty(credentials)) {
      if (!job.credentials.provisioningProfile) {
        // a user has generated the provisioning profile for his app, but he probably deleted it from Expo servers, ...
        throw new BuildError(
          BuildErrorReason.PROVISIONING_PROFILE_MISSING,
          `Provisioning profile is missing on Expo servers.`,
        );
      }
      return;
    }

    logger.info('New ad hoc provisioning profile successfully created');
    job.credentials.provisioningProfile = credentials.provisioningProfile;

    if (isOffline()) {
      const provisioningProfilePath = path.join(job.projectDir, `adhoc.mobileprovision`);
      await fs.writeFile(provisioningProfilePath, Buffer.from(credentials.provisioningProfile, 'base64'));
      logger.info(`Saved provisioning profile to ${provisioningProfilePath}`);
    } else {
      await sqs.sendMessage(job.id, UPDATE_CREDENTIALS, {
        provisioningProfileId: credentials.provisioningProfileId,
        provisioningProfile: credentials.provisioningProfile,
      }, logger);
      logger.info('Ad Hoc provisioning profile sent to storage successfully');
    }
  } catch (e) {
    if (e instanceof BuildError) {
      logger.error('Apple Session expired! Please authenticate again using expo-cli.');
    }
    throw e;
  }
}

async function runFastlaneAction(action: string, args: string[], { env }: any) {
  const { stderr } = await spawnAsync(
    action,
    args,
    {
      stdio: ['inherit', 'pipe', 'pipe'],
      env: { ...process.env, ...env },
    },
  );
  const { result, ...rest } = JSON.parse(stderr.trim());
  if (result === 'failure') {
    const { reason, rawDump, type } = rest;
    let errorMsg = `Reason: ${reason}`;
    if (rawDump) {
      errorMsg += `, raw: ${JSON.stringify(rawDump)}`;
    }
    if (type === 'session-expired') {
      throw new BuildError(BuildErrorReason.SESSION_EXPIRED, errorMsg);
    } else {
      throw new Error(errorMsg);
    }
  } else {
    return rest;
  }
}

export default prepareAdHocBuildCredentials;
