import path from 'path';

import fs from 'fs-extra';
import uuidv4 from 'uuid/v4';
import { Credentials } from 'xdl';

import * as sqs from 'turtle/aws/sqs';
import { UPDATE_CREDENTIALS } from 'turtle/constants/build';
import { IAndroidCredentials, IJob } from 'turtle/job';
import logger from 'turtle/logger';
import { isOffline } from 'turtle/turtleContext';

async function getOrCreateCredentials(jobData: IJob): Promise<IAndroidCredentials> {
  if (!jobData.credentials) {
    const l = logger.child({ buildPhase: 'generating keystore' });
    const credentials: any = {};
    l.info('Creating keystore');
    const keystoreFilename = `/tmp/keystore-${jobData.id}.tmp.jks`;
    credentials.keystorePassword = uuidv4().replace(/-/g, '');
    credentials.keyPassword = uuidv4().replace(/-/g, '');
    credentials.keystoreAlias = Buffer.from(jobData.experienceName).toString('base64');
    const androidPackage = jobData.manifest.android.package;

    await Credentials.Android.createKeystore(
      {
        keystorePath: keystoreFilename,
        keystorePassword: credentials.keystorePassword,
        keyPassword: credentials.keyPassword,
        keyAlias: credentials.keystoreAlias,
      },
      androidPackage,
    );

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
      });
      l.info('Keystore sent to storage successfully');
    }
    await fs.unlink(keystoreFilename);
    return credentials;
  }

  return jobData.credentials as IAndroidCredentials;
}

export default getOrCreateCredentials;
