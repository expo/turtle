import { LoggerDetach } from 'xdl';

import config from 'turtle/config';
import logger from 'turtle/logger';
import { doJob } from 'turtle/jobManager';
import { setShouldExit, checkShouldExit } from 'turtle/turtleContext';

process.on('unhandledRejection', err => logger.error('Unhandled promise rejection:', err));

function handleExit() {
  if (checkShouldExit()) {
    logger.warn(`Received termination signal again. Forcing exit now.`);
    process.exit(1);
  }
  logger.warn(
    `Received termination signal. Will exit after current build. To force exit press Ctrl-C again`
  );
  setShouldExit();
}
process.on('SIGTERM', handleExit);
process.on('SIGINT', handleExit);

async function main() {
  logger.info(
    `Starting Turtle... (NODE_ENV=${config.env}, PLATFORM=${config.platform}, DEPLOYMENT_ENVIRONMENT=${config.deploymentEnv})`
  );
  LoggerDetach.configure(logger);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await doJob();
    } catch (err) {
      logger.error('Failed to do a job', err);
    }
  }
}

main()
  .then(() => logger.error('This should never happen...'))
  .catch(err => logger.error('Something went terribly wrong :(', err))
  .then(() => process.exit(1));
