import Redis from 'ioredis';

import logger from 'turtle/logger';
import config from 'turtle/config';

const MILLIS_TO_UPLOAD_LOGS = 3000;
const MILLIS_CONNECTION_TIMEOUT = 10000;

function connect(timeoutMs: number) {
  return new Promise((resolve, reject) => {
    const redisClient = new Redis(config.redis.url, {
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

const REDIS_CLIENT_SUBSCRIBER = 'REDIS_CLIENT_SUBSCRIBER';
const REDIS_CLIENT_DEFAULT = 'REDIS_CLIENT_DEFAULT';

interface IRedisClients {
  [key: string]: any;
}

const _redisClients: IRedisClients = {
  [REDIS_CLIENT_SUBSCRIBER]: null,
  [REDIS_CLIENT_DEFAULT]: null,
};

async function getRedisClient(type = REDIS_CLIENT_DEFAULT) {
  if (!_redisClients[type]) {
    try {
      _redisClients[type] = await connect(MILLIS_CONNECTION_TIMEOUT);
    } catch (err) {
      logger.error(err);
    }
  }
  return _redisClients[type];
}

export async function checkIfCancelled(jobId: string) {
  try {
    const redis = await getRedisClient();
    return await redis.get(`jobs:cancelled:${jobId}`);
  } catch (err) {
    if (config.deploymentEnv === 'development') {
      logger.warn('Did you turn on redis server? Run `yarn start-docker` in server/www');
    }
    logger.error(err);
    return false;
  }
}

export async function registerListener(jobId: string, deleteMessage: any) {
  try {
    const redis = await getRedisClient(REDIS_CLIENT_SUBSCRIBER);
    redis.subscribe('jobs:cancelled');
    redis.on('message', async function(_: any, message: any) {
      if (message === jobId) {
        logger.info({ lastBuildLog: true }, 'Job cancelled - killing process');
        await deleteMessage();
        setTimeout(() => process.exit(1), MILLIS_TO_UPLOAD_LOGS);
      }
    });
  } catch (err) {
    logger.info("Couldn't connect to Redis - job will be continued even if cancelled during build");
    logger.error(err);
  }
}

export async function unregisterListeners() {
  try {
    const redis = await getRedisClient();
    redis.removeAllListeners('message');
  } catch (err) {
    logger.error(err);
  }
}
