import path from 'path';

import { AndroidCredentials } from '@expo/xdl';
import fs from 'fs-extra';
import get from 'lodash/get';
import uuidv4 from 'uuid/v4';

import { IAndroidCredentials, IJob } from 'turtle/job';
import logger from 'turtle/logger';
import { isOffline } from 'turtle/turtleContext';
import { sendCredentialsUpdate } from 'turtle/utils/www';

async function getOrCreateCredentials(jobData: IJob): Promise<IAndroidCredentials> {
  if (!jobData.credentials) {
    const l = logger.child({ buildPhase: 'generating keystore' });
    const credentials: any = {};
    l.info('Creating keystore');
    const keystoreFilename = `/tmp/keystore-${jobData.id}.tmp.jks`;
    credentials.keystorePassword = uuidv4().replace(/-/g, '');
    credentials.keyPassword = uuidv4().replace(/-/g, '');
    credentials.keystoreAlias = Buffer.from(jobData.experienceName).toString('base64');
    const androidPackage =
      get(jobData, 'manifest.android.package')
      || get(jobData, 'config.androidPackage');
    if (!androidPackage) {
      throw new Error(
        'Android package name is not set in the app manifest (please update app.json if you\'re using turtle-cli).',
      );
    }

    await AndroidCredentials.createKeystore(
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
      await sendCredentialsUpdate(jobData.id, 'android', credentials);
      l.info('Keystore sent to storage successfully');
    }
    await fs.unlink(keystoreFilename);
    return credentials;
  }

  return jobData.credentials as IAndroidCredentials;
}

export default getOrCreateCredentials;
