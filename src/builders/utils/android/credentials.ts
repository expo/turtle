import path from 'path';

import uuidv4 from 'uuid/v4';
import fs from 'fs-extra';
import { AndroidKeystore } from 'xdl';

import * as sqs from 'turtle/aws/sqs';
import { UPDATE_CREDENTIALS } from 'turtle/constants/build';
import logger from 'turtle/logger';
import { isOffline } from 'turtle/turtleContext';
import { IAndroidCredentials, IJob } from 'turtle/job';

async function getOrCreateCredentials(jobData: IJob): Promise<IAndroidCredentials> {
  if (!jobData.credentials) {
    const l = logger.withFields({ buildPhase: 'generating keystore' });
    const credentials: any = {};
    l.info('Creating keystore');
    const keystoreFilename = `/tmp/keystore-${jobData.id}.tmp.jks`;
    credentials.keystorePassword = uuidv4().replace(/-/g, '');
    credentials.keyPassword = uuidv4().replace(/-/g, '');
    credentials.keystoreAlias = Buffer.from(jobData.experienceName).toString('base64');
    const androidPackage = jobData.manifest.android.package;

    await AndroidKeystore.createKeystore({
      keystorePassword: credentials.keystorePassword,
      keyPassword: credentials.keyPassword,
      keystoreFilename,
      keystoreAlias: credentials.keystoreAlias,
      androidPackage,
    });

    credentials.keystore = (await fs.readFile(keystoreFilename)).toString('base64');
    l.info('Keystore created successfully');
    if (isOffline()) {
      const projectKeystorePath = path.join(jobData.projectDir, `${jobData.experienceName}.jks`);
      await fs.copy(keystoreFilename, projectKeystorePath);
      l.info(`Saved created keystore to ${projectKeystorePath}`);
      l.info(`Keystore password: ${credentials.keystorePassword}`);
      l.info(`Keystore alias: ${credentials.keystoreAlias}`);
      l.info(`Key password: ${credentials.keyPassword}`);
      l.info(`Please keep these credentials safe`);
    } else {
      await sqs.sendMessage(jobData.id, UPDATE_CREDENTIALS, {
        ...credentials,
        turtleVersion: jobData.config.turtleVersion,
      });
      l.info('Keystore sent to storage successfully');
    }
    await fs.unlink(keystoreFilename);
    return credentials;
  }

  return jobData.credentials as IAndroidCredentials;
}

export default getOrCreateCredentials;
