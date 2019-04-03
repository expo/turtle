import { LoggerDetach } from 'xdl';

import config from 'turtle/config';
import { doJob } from 'turtle/jobManager';
import logger from 'turtle/logger';
import setup from 'turtle/setup';
import { checkShouldExit, setShouldExit, turtleVersion } from 'turtle/turtleContext';
import { getRedisClient, RedisClient } from 'turtle/utils/redis';

const REDIS_TURTLE_VERSION_KEY = 'turtle:version';

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
    const redis = await getRedisClient(RedisClient.Configuration);
    await redis.set(REDIS_TURTLE_VERSION_KEY, turtleVersion);
    logger.info(`Register Turtle version ${turtleVersion} in Redis`);
  } catch (err) {
    logger.error({ err }, 'Failed to register Turtle version in Redis');
  }

  while (true) {
    try {
      await doJob();
    } catch (err) {
      logger.error({ err }, 'Failed to do a job');
    }
  }
}

main()
  .then(() => logger.error('This should never happen...'))
  .catch((err) => logger.error({ err }, 'Something went terribly wrong'))
  .then(() => process.exit(1));
