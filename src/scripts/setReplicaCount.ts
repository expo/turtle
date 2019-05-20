import isNaN from 'lodash/isNaN';

import { PLATFORMS } from 'turtle/constants';
import logger from 'turtle/logger';
import { setReplicaCount } from 'turtle/utils/metadata';
import { getRedisClient, RedisClient } from 'turtle/utils/redis';

async function run() {
  const platform = process.env.SCRIPT_PLATFORM;
  const replicaCountRaw = process.env.SCRIPT_REPLICA_COUNT;
  const replicaCount = Number(replicaCountRaw);

  if (!platform || !replicaCountRaw) {
    throw new Error('You must set both SCRIPT_PLATFORM and SCRIPT_REPLICA_COUNT env variables.');
  }

  if (!Object.values(PLATFORMS).includes(platform)) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  if (isNaN(replicaCount)) {
    throw new Error(`Wrong value for replica count: ${replicaCountRaw}`);
  }

  const redis = await getRedisClient(RedisClient.Configuration);
  logger.info(`[${platform}] Setting replica count in redis to ${replicaCount}`);
  await setReplicaCount(platform as PLATFORMS, replicaCount);
  redis.disconnect();
}

if (require.main === module) {
  run()
    .then(() => logger.info('All done'))
    .catch((err) => {
      logger.error('Error:', err);
      process.exit(1);
    });
}
