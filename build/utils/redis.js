"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../logger"));
const MILLIS_TO_UPLOAD_LOGS = 3000;
exports.MILLIS_CONNECTION_TIMEOUT = 10000;
var RedisClient;
(function (RedisClient) {
    RedisClient["Subscriber"] = "REDIS_CLIENT_SUBSCRIBER";
    RedisClient["Default"] = "REDIS_CLIENT_DEFAULT";
    RedisClient["Configuration"] = "REDIS_CLIENT_CONFIGURATION";
})(RedisClient = exports.RedisClient || (exports.RedisClient = {}));
const clientToUrl = {
    [RedisClient.Subscriber]: config_1.default.redis.url,
    [RedisClient.Default]: config_1.default.redis.url,
    [RedisClient.Configuration]: config_1.default.redis.configUrl,
};
function connect(timeoutMs, type) {
    return new Promise((resolve, reject) => {
        const redisClient = new ioredis_1.default(clientToUrl[type], {
            maxRetriesPerRequest: 2,
        });
        const timer = setTimeout(() => reject(new Error('Timeout at connecting to Redis')), timeoutMs);
        redisClient.on('ready', () => {
            clearTimeout(timer);
            resolve(redisClient);
        });
        redisClient.on('error', (err) => {
            clearTimeout(timer);
            reject(err);
        });
    });
}
exports.connect = connect;
const redisClients = {
    [RedisClient.Subscriber]: null,
    [RedisClient.Default]: null,
    [RedisClient.Configuration]: null,
};
async function getRedisClient(type = RedisClient.Default) {
    if (!redisClients[type]) {
        try {
            redisClients[type] = await connect(exports.MILLIS_CONNECTION_TIMEOUT, type);
        }
        catch (err) {
            logger_1.default.error({ err });
        }
    }
    return redisClients[type];
}
exports.getRedisClient = getRedisClient;
async function checkIfCancelled(jobId) {
    try {
        const redis = await getRedisClient();
        return await redis.get(`jobs:cancelled:${jobId}`);
    }
    catch (err) {
        if (config_1.default.deploymentEnv === 'development') {
            logger_1.default.warn('Did you turn on redis server? Run `yarn start-docker` in $EXPO_UNIVERSE_DIR/server/www');
        }
        logger_1.default.error({ err });
        return false;
    }
}
exports.checkIfCancelled = checkIfCancelled;
async function registerListener(jobId, deleteMessage) {
    try {
        const redis = await getRedisClient(RedisClient.Subscriber);
        redis.subscribe('jobs:cancelled');
        redis.on('message', async (_, message) => {
            if (message === jobId) {
                logger_1.default.info({ lastBuildLog: true }, 'Job cancelled - killing process');
                await deleteMessage();
                await logger_1.default.cleanup();
                setTimeout(() => process.exit(1), MILLIS_TO_UPLOAD_LOGS);
            }
        });
    }
    catch (err) {
        logger_1.default.info('Couldn\'t connect to Redis - job will be continued even if cancelled during build');
        logger_1.default.error(err);
    }
}
exports.registerListener = registerListener;
async function unregisterListeners() {
    try {
        const redis = await getRedisClient();
        redis.removeAllListeners('message');
    }
    catch (err) {
        logger_1.default.error(err);
    }
}
exports.unregisterListeners = unregisterListeners;
//# sourceMappingURL=redis.js.map