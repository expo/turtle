import commonSetup from 'turtle/setup/common';

export default async function setup(logger: any) {
  logger.info('Setting up environment...');
  await commonSetup(logger);
  logger.info('Finished setting up environment');
}
