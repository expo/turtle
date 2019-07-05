import config from 'turtle/config';
import { PLATFORMS } from 'turtle/constants';
import { getRedisClient, RedisClient } from 'turtle/utils/redis';

const createKeyPrefix = (platform: PLATFORMS) => `${config.deploymentEnv}:${platform}`;
const createReplicaCountKey = (platform: PLATFORMS) => `${createKeyPrefix(platform)}:replicaCount`;

export async function getReplicaCount(maybePlatform?: PLATFORMS) {
  const platform = maybePlatform || config.platform;
  const redis = await getRedisClient(RedisClient.Configuration);
  const result = await redis.get(createReplicaCountKey(platform));
  return result === null ? null : Number(result);
}
