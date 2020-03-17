"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const isEqual_1 = __importDefault(require("lodash/isEqual"));
const os_1 = __importDefault(require("os"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../logger"));
const redis_1 = require("./redis");
exports.NORMAL = 'normalPriority';
exports.HIGH = 'highPriority';
var TurtleModeLabels;
(function (TurtleModeLabels) {
    TurtleModeLabels["Normal"] = "normal";
    TurtleModeLabels["High"] = "high";
    TurtleModeLabels["HighOnly"] = "highOnly";
})(TurtleModeLabels = exports.TurtleModeLabels || (exports.TurtleModeLabels = {}));
exports.NORMAL_CONFIGURATION = [exports.NORMAL, exports.HIGH];
exports.HIGH_CONFIGURATION = [exports.HIGH, exports.NORMAL];
exports.HIGH_ONLY_CONFIGURATION = [exports.HIGH];
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
const configSchema = joi_1.default.array().required().items(joi_1.default.string().only(exports.NORMAL, exports.HIGH));
function configPrefix(platform) {
    return `${config_1.default.deploymentEnv}:${platform}`;
}
function createConfigurationsKey(platform = config_1.default.platform) {
    return `${configPrefix(platform)}:configurations`;
}
exports.createConfigurationsKey = createConfigurationsKey;
function createDefaultConfigurationKey(platform = config_1.default.platform) {
    return `${configPrefix(platform)}:default`;
}
exports.createDefaultConfigurationKey = createDefaultConfigurationKey;
async function getPriorities() {
    if (config_1.default.env === 'test' || config_1.default.deploymentEnv === 'development') {
        return exports.NORMAL_CONFIGURATION;
    }
    try {
        const redis = await redis_1.getRedisClient(redis_1.RedisClient.Configuration);
        if (redis.getConfig === undefined) {
            redis.defineCommand('getConfig', {
                numberOfKeys: 2,
                lua: REDIS_GET_CONFIG,
            });
        }
        try {
            const configurations = await getConfiguration(redis);
            const configurationsIndex = await redis.getConfig(createConfigurationsKey(), os_1.default.hostname());
            logger_1.default.debug(`Using configuration at index ${configurationsIndex} pulled from redis`);
            const { error, value: configValue } = configSchema.validate(configurations[configurationsIndex]);
            if (error) {
                logger_1.default.warn({ err: error });
                throw new Error('Received configuration is not valid');
            }
            return configValue;
        }
        catch (err) {
            logger_1.default.warn({ err });
            const defaultConfig = JSON.parse(await redis.get(createDefaultConfigurationKey()));
            const { error, value: defaultConfigValue } = configSchema.validate(defaultConfig);
            if (error) {
                logger_1.default.warn({ err: error });
                throw new Error('Received default configuration is not valid');
            }
            logger_1.default.warn('Using default configuration pulled from redis');
            return defaultConfigValue;
        }
    }
    catch (err) {
        logger_1.default.warn({ err }, 'Using configuration chosen locally');
        if (Math.random() < 0.7) {
            return exports.HIGH_CONFIGURATION;
        }
        else {
            return exports.NORMAL_CONFIGURATION;
        }
    }
}
exports.getPriorities = getPriorities;
async function getConfiguration(currentRedisClient) {
    const redis = currentRedisClient || await redis_1.getRedisClient(redis_1.RedisClient.Configuration);
    return JSON.parse(await redis.get(createConfigurationsKey()));
}
async function getLabeledConfiguration(currentRedisClient) {
    const configuration = await getConfiguration(currentRedisClient);
    return configuration.map((i) => {
        if (isEqual_1.default(i, exports.NORMAL_CONFIGURATION)) {
            return TurtleModeLabels.Normal;
        }
        else if (isEqual_1.default(i, exports.HIGH_CONFIGURATION)) {
            return TurtleModeLabels.High;
        }
        else {
            return TurtleModeLabels.HighOnly;
        }
    });
}
exports.getLabeledConfiguration = getLabeledConfiguration;
//# sourceMappingURL=priorities.js.map