import { LoggerDetach } from '@expo/xdl';

import { findSupportedSdkVersions } from 'turtle/builders/utils/version';
import config from 'turtle/config';
import { doJob } from 'turtle/jobManager';
import logger from 'turtle/logger';
import setup from 'turtle/setup';
import { checkShouldExit, setShouldExit, turtleVersion } from 'turtle/turtleContext';
import { setSupportedSdkVersions, setTurtleVersion } from 'turtle/utils/versions';

process.on('unhandledRejection', (err) => logger.error({ err }, 'Unhandled promise rejection'));

function handleExit() {
  if (checkShouldExit()) {
    logger.warn(`Received termination signal again. Forcing exit now.`);
    process.exit(1);
  }
  logger.warn(
    `Received termination signal. Will exit after current build. To force exit press Ctrl-C again`,
  );
  setShouldExit();
}
process.on('SIGTERM', handleExit);
process.on('SIGINT', handleExit);

async function main() {
  logger.info(
    'Starting Turtle... '
    + `NODE_ENV=${config.env}, PLATFORM=${config.platform}, DEPLOYMENT_ENVIRONMENT=${config.deploymentEnv}`,
  );
  LoggerDetach.configure(logger);
  if (setup[config.platform]) {
    await setup[config.platform]();
  }

  try {
    await setTurtleVersion(turtleVersion);
    logger.info(`Registered Turtle version (${turtleVersion}) in www`);
    const sdkVersions = (await findSupportedSdkVersions(config.platform)).map((version) => `${version}.0.0`);
    await setSupportedSdkVersions(config.platform, sdkVersions);
    logger.info(`Registered supported SDK versions (${sdkVersions}) in www`);
  } catch (err) {
    logger.error({ err }, 'Failed to register versions in www');
  }

  while (true) {
    try {
      await doJob();
    } catch (err) {
      logger.error({ err }, 'Failed to process a job');
    }
  }
}

main()
  .then(() => logger.error('This should never happen...'))
  .catch((err) => logger.error({ err }, 'Something went terribly wrong'))
  .then(() => process.exit(1));
