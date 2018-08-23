import * as keychain from 'turtle/builders/utils/ios/keychain';
import logger from 'turtle/logger';
import commonSetup from 'turtle/setup/common';

export default async function setup() {
  logger.info('Setting up environment...');
  await keychain.cleanUp();
  await commonSetup();
  logger.info('Finished setting up environment');
}
