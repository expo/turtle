import path from 'path';

import spawnAsync from '@expo/spawn-async';
import { IosCodeSigning } from '@expo/xdl';
import fs from 'fs-extra';

import * as sqs from 'turtle/aws/sqs';
import BuildError, { BuildErrorReason } from 'turtle/builders/BuildError';
import { UPDATE_CREDENTIALS } from 'turtle/constants/build';
import { IJob } from 'turtle/job';
import logger from 'turtle/logger';
import { isOffline } from 'turtle/turtleContext';

// tslint:disable-next-line:no-var-requires
const travelingFastlane = process.platform === 'darwin' ? require('@expo/traveling-fastlane-darwin')() : null;

async function prepareAdHocBuildCredentials(job: IJob) {
  if (process.platform !== 'darwin') {
    throw new Error('This function should be called only on macOS!');
  }

  const { bundleIdentifier } = job.config;
  const {
    certP12,
    certPassword,
    teamId,
    appleSession,
    udids,
    provisioningProfileId,
  } = job.credentials;

  const certSerialNumber = IosCodeSigning.findP12CertSerialNumber(certP12, certPassword);
  const args = [
    ...(provisioningProfileId ? ['--profile-id', provisioningProfileId] : []),
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

    logger.info('New ad hoc provisioning profile successfully created');
    job.credentials.provisioningProfile = credentials.provisioningProfile;

    if (!credentials.provisioningProfileUpdateTimestamp) {
      //  dont need to persist profile because nothing changed
      return;
    }

    if (isOffline()) {
      const provisioningProfilePath = path.join(job.projectDir, `adhoc.mobileprovision`);
      await fs.writeFile(provisioningProfilePath, Buffer.from(credentials.provisioningProfile, 'base64'));
      logger.info(`Saved provisioning profile to ${provisioningProfilePath}`);
    } else {
      await sqs.sendMessage(job.id, UPDATE_CREDENTIALS, {
        provisioningProfileId: credentials.provisioningProfileId,
        provisioningProfile: credentials.provisioningProfile,
      });
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
