import Redis from 'ioredis';
import chunk from 'lodash/chunk';

import config from 'turtle/config';
import { getRedisClient, RedisClient } from 'turtle/utils/redis';
import { sendBuildStatusUpdate, sendCredentialsUpdate } from 'turtle/utils/www';

const RETRY_COUNT = 5;

type UpdateType = 'build' | 'credentials';
interface IUpdate {
  type: UpdateType;
  buildId: string;
  updateBody: any;
  retried: number;
}

export async function saveUpdateFailure(buildId: string, type: UpdateType, updateBody: object): Promise<void> {
  const redis = await getRedisClient(RedisClient.Configuration) as Redis.Redis;
  const update: IUpdate = {
    type,
    buildId,
    updateBody,
    retried: 0,
  };
  await redis.set(getFailedUpdateKey(buildId), JSON.stringify(update));
}

export async function synchronizeFailedUpdates(intervalMs = 15 * 1000): Promise<NodeJS.Timeout> {
  try {
    await _synchronizeFailedUpdates();
  } catch (err) {
    // don't do anything
  }
  return setInterval(() => _synchronizeFailedUpdates(), intervalMs);
}

async function _synchronizeFailedUpdates(): Promise<void> {
  const redis = await getRedisClient(RedisClient.Configuration) as Redis.Redis;
  const keys = await redis.keys(getFailedUpdateKey('*'));
  const keyChunks = chunk(keys, 20);
  for (const keyChunk of keyChunks) {
    await Promise.all(keyChunk.map((key: string) => resendUpdateForKey(key)));
  }
}

async function resendUpdateForKey(key: string): Promise<void> {
  try {
    const redis = await getRedisClient(RedisClient.Configuration) as Redis.Redis;
    const updateRaw = await redis.get(key);
    if (updateRaw) {
      const update = JSON.parse(updateRaw) as IUpdate;
      try {
        await resendUpdateToWWW(update);
        await redis.del(key);
      } catch (err) {
        update.retried += 1;
        if (update.retried >= RETRY_COUNT) {
          await redis.del(key);
        } else {
          await redis.set(key, JSON.stringify(update));
        }
      }
    }
  } catch (err) {
    // don't do anything
  }
}

async function resendUpdateToWWW(update: IUpdate): Promise<void> {
  const { type, buildId, updateBody } = update;
  if (type === 'build') {
    await sendBuildStatusUpdate(buildId, updateBody);
  } else if (type === 'credentials') {
    const { platform, ...rest } = updateBody;
    await sendCredentialsUpdate(buildId, platform, rest);
  }
}

const getFailedUpdateKey = (buildId: string) => `${config.deploymentEnv}:failed-update:${buildId}`;
