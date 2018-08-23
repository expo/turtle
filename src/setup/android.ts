import logger from 'turtle/logger';
import commonSetup from 'turtle/setup/common';

export default async function setup() {
  logger.info('Setting up environment...');
  await commonSetup();
  logger.info('Finished setting up environment');
}
