import { LoggerDetach } from './xdl';

import { findSupportedSdkVersions } from 'turtle/builders/utils/version';
import config from 'turtle/config';
import { doJob } from 'turtle/jobManager';
import logger from 'turtle/logger';
import setup from 'turtle/setup';
import {
  checkShouldExit,
  setShouldExit,
  turtleVersion,
} from 'turtle/turtleContext';
import { synchronizeFailedUpdates } from 'turtle/updatesManager';
import Leader, { LeaderEvent } from 'turtle/utils/leader';
import {
  setSupportedSdkVersions,
  setTurtleVersion,
} from 'turtle/utils/versions';

process.on('unhandledRejection', (err) =>
  logger.error({ err }, 'Unhandled promise rejection'),
);

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
    'Starting Turtle... ' +
      `NODE_ENV=${config.env}, PLATFORM=${config.platform}, DEPLOYMENT_ENVIRONMENT=${config.deploymentEnv}`,
  );
  // @ts-ignore: Type mismatch
  LoggerDetach.configure(logger);
  if (setup[config.platform]) {
    await setup[config.platform]();
  }

  await electLeaderAndSynchronize();

  try {
    await setTurtleVersion(turtleVersion);
    logger.info(`Registered Turtle version (${turtleVersion}) in www`);
    const sdkVersions = (await findSupportedSdkVersions(config.platform)).map(
      (version) => `${version}.0.0`,
    );
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

async function electLeaderAndSynchronize() {
  if (config.env === 'test') {
    return;
  }
  const l = new Leader({
    key: config.leader.redisKey,
    id: config.hostname,
    ttl: config.leader.redisKeyTTLSec,
  });
  let intervalId: NodeJS.Timeout;
  l.on(LeaderEvent.elected, async () => {
    intervalId = await synchronizeFailedUpdates();
  });
  l.on(LeaderEvent.revoked, () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });
  await l.elect();
}

main()
  .then(() => logger.error('This should never happen...'))
  .catch((err) => logger.error({ err }, 'Something went terribly wrong'))
  .then(() => process.exit(1));
