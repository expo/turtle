import { LoggerDetach } from 'xdl';

import config, { setShouldExit, checkShouldExit } from 'turtle/config';
import logger from 'turtle/logger';
import { doJob } from 'turtle/jobManager';

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
  logger.info(`Starting Turtle... (NODE_ENV=${config.env}, PLATFORM=${config.platform})`);
  LoggerDetach.configure(logger);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await doJob();
  }
}

main()
  .then(() => logger.error('This should never happen...'))
  .catch(err => logger.error('Something went terribly wrong :(', err))
  .then(() => process.exit(1));
