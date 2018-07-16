import fs from 'fs-extra';
import * as keychain from 'turtle/builders/utils/ios/keychain';

import logger from 'turtle/logger';
import config from 'turtle/config';

export default async function setup() {
  logger.info('Setting up environment...');
  await keychain.cleanUp();
  await fs.remove(config.builder.temporaryFilesRoot);
  logger.info('Finished setting up environment');
}
