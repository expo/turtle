import Joi from 'joi';
import os from 'os';

import config from 'turtle/config';
import logger from 'turtle/logger';
import { getRedisClient, RedisClient } from 'turtle/utils/redis';

export const NORMAL = 'normalPriority';
export const HIGH = 'highPriority';

export const NORMAL_CONFIGURATION = [NORMAL, HIGH];
export const HIGH_CONFIGURATION = [HIGH, NORMAL];

const REDIS_GET_CONFIG = `
  local i = 0
  local current
  local configuration_index_key
  while i < 20 do
    configuration_index_key = KEYS[1].."."..i
    current = redis.call("get", configuration_index_key)
    if (current == false or current == KEYS[2]) then
      break
    end
    i = i + 1
  end
  redis.call("setex", configuration_index_key, 60 * 30, KEYS[2])
  return i
`;
const configSchema = Joi.array().required().items(Joi.string().only(NORMAL, HIGH));

function configPrefix(platform: string) {
  return `${config.deploymentEnv}:${platform}`;
}

export function createConfigurationsKey(platform = config.platform) {
  return `${configPrefix(platform)}:configurations`;
}

export function createDefaultConfigurationKey(platform = config.platform) {
  return `${configPrefix(platform)}:default`;
}

export async function getPriorities() {
  if (config.env === 'test') {
    return NORMAL_CONFIGURATION;
  }

  try {
    const redis = await getRedisClient(RedisClient.Configuration);
    if (redis.getConfig === undefined) {
      redis.defineCommand('getConfig', {
        numberOfKeys: 2,
        lua: REDIS_GET_CONFIG,
      });
    }

    try {
      const configurations = JSON.parse(await redis.get(createConfigurationsKey()));
      const configurationsIndex = await redis.getConfig(createConfigurationsKey(), os.hostname());
      logger.debug(`Using configuration at index ${configurationsIndex} pulled from redis`);
      const { error, value: configValue } = configSchema.validate(configurations[configurationsIndex]);
      if (error) {
        logger.warn(error);
        throw new Error('Received configuration is not valid');
      }
      return configValue;
    } catch (err) {
      logger.warn(err);
      const defaultConfig = JSON.parse(await redis.get(createDefaultConfigurationKey()));
      const { error, value: defaultConfigValue } = configSchema.validate(defaultConfig);
      if (error) {
        logger.warn(error);
        throw new Error('Received default configuration is not valid');
      }
      logger.warn('Using default configuration pulled from redis');
      return defaultConfigValue;
    }
  } catch (err) {
    logger.warn(err);
    logger.warn('Using configuration chosen locally');
    if (Math.random() < 0.7) {
      return HIGH_CONFIGURATION;
    } else {
      return NORMAL_CONFIGURATION;
    }
  }
}
