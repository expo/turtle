import config from 'turtle/config';
import { PLATFORMS } from 'turtle/constants';

const createKeyPrefix = (platform: PLATFORMS) => `${config.deploymentEnv}:${platform}`;
const createReplicaCountKey = (platform: PLATFORMS) => `${createKeyPrefix(platform)}:replicaCount`;

export async function setReplicaCount(redis: any, platform: PLATFORMS, replicaCount: number) {
  await redis.set(
    createReplicaCountKey(platform),
    replicaCount,
  );
}
