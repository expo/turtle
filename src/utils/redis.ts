import Redis from 'ioredis';

import config from 'turtle/config';

const MILLIS_TO_UPLOAD_LOGS = 3000;
export const MILLIS_CONNECTION_TIMEOUT = 10000;

export enum RedisClient {
  Subscriber = 'REDIS_CLIENT_SUBSCRIBER',
  Default = 'REDIS_CLIENT_DEFAULT',
  Configuration = 'REDIS_CLIENT_CONFIGURATION',
}

interface IClientConfig { [key: string]: string; }

const clientToUrl: IClientConfig = {
  [RedisClient.Subscriber]: config.redis.url,
  [RedisClient.Default]: config.redis.url,
  [RedisClient.Configuration]: config.redis.configUrl,
};

export function connect(timeoutMs: number, type: string) {
  return new Promise((resolve, reject) => {
    const redisClient = new Redis(clientToUrl[type], {
      maxRetriesPerRequest: 2,
    });
    const timer = setTimeout(() => reject(new Error('Timeout at connecting to Redis')), timeoutMs);
    redisClient.on('ready', () => {
      clearTimeout(timer);
      resolve(redisClient);
    });
    redisClient.on('error', (err: Error) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

interface IRedisClients {
  [key: string]: any;
}

const redisClients: IRedisClients = {
  [RedisClient.Subscriber]: null,
  [RedisClient.Default]: null,
  [RedisClient.Configuration]: null,
};

export async function getRedisClient(logger: any, type = RedisClient.Default) {
  if (!redisClients[type]) {
    try {
      redisClients[type] = await connect(MILLIS_CONNECTION_TIMEOUT, type);
    } catch (err) {
      logger.error({ err });
    }
  }
  return redisClients[type];
}

export async function checkIfCancelled(jobId: string, logger: any) {
  try {
    const redis = await getRedisClient(logger);
    return await redis.get(`jobs:cancelled:${jobId}`);
  } catch (err) {
    if (config.deploymentEnv === 'development') {
      logger.warn('Did you turn on redis server? Run `yarn start-docker` in server/www');
    }
    logger.error({ err });
    return false;
  }
}

export async function registerListener(jobId: string, deleteMessage: any, logger: any) {
  try {
    const redis = await getRedisClient(RedisClient.Subscriber);
    redis.subscribe('jobs:cancelled');
    redis.on('message', async (_: any, message: any) => {
      if (message === jobId) {
        logger.info({ lastBuildLog: true }, 'Job cancelled - killing process');
        await deleteMessage();
        setTimeout(() => process.exit(1), MILLIS_TO_UPLOAD_LOGS);
      }
    });
  } catch (err) {
    logger.info('Couldn\'t connect to Redis - job will be continued even if cancelled during build');
    logger.error(err);
  }
}

export async function unregisterListeners(logger: any) {
  try {
    const redis = await getRedisClient(logger);
    redis.removeAllListeners('message');
  } catch (err) {
    logger.error(err);
  }
}
