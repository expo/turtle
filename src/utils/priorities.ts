import Joi from 'joi';
import isEqual from 'lodash/isEqual';
import os from 'os';

import config from 'turtle/config';
import logger from 'turtle/logger';
import { getRedisClient, RedisClient } from 'turtle/utils/redis';

export const NORMAL = 'normalPriority';
export const HIGH = 'highPriority';

export enum TurtleMode {
  Normal = 'normal',
  High = 'high',
  HighOnly = 'highOnly',
}

export const NORMAL_CONFIGURATION = [NORMAL, HIGH];
export const HIGH_CONFIGURATION = [HIGH, NORMAL];
export const HIGH_ONLY_CONFIGURATION = [HIGH];

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
  if (config.env === 'test' || config.deploymentEnv === 'development') {
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
      const configurations = await getConfiguration(redis);
      const configurationsIndex = await redis.getConfig(createConfigurationsKey(), os.hostname());
      logger.debug(`Using configuration at index ${configurationsIndex} pulled from redis`);
      const { error, value: configValue } = configSchema.validate(configurations[configurationsIndex]);
      if (error) {
        logger.warn({ err: error });
        throw new Error('Received configuration is not valid');
      }
      return configValue;
    } catch (err) {
      logger.warn({ err });
      const defaultConfig = JSON.parse(await redis.get(createDefaultConfigurationKey()));
      const { error, value: defaultConfigValue } = configSchema.validate(defaultConfig);
      if (error) {
        logger.warn({ err: error });
        throw new Error('Received default configuration is not valid');
      }
      logger.warn('Using default configuration pulled from redis');
      return defaultConfigValue;
    }
  } catch (err) {
    logger.warn({ err }, 'Using configuration chosen locally');
    if (Math.random() < 0.7) {
      return HIGH_CONFIGURATION;
    } else {
      return NORMAL_CONFIGURATION;
    }
  }
}

async function getConfiguration(currentRedisClient: any) {
  const redis = currentRedisClient || await getRedisClient(RedisClient.Configuration);
  return JSON.parse(await redis.get(createConfigurationsKey()));
}

export async function getLabeledConfiguration(currentRedisClient?: any) {
  const configuration = await getConfiguration(currentRedisClient);
  return configuration.map((i: string[]) => labelConfiguration(i));
}

export function labelConfiguration(configuration: string[]): TurtleMode {
  if (isEqual(configuration, NORMAL_CONFIGURATION)) {
    return TurtleMode.Normal;
  } else if (isEqual(configuration, HIGH_CONFIGURATION)) {
    return TurtleMode.High;
  } else {
    return TurtleMode.HighOnly;
  }
}
