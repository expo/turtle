"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config"));
const redis_1 = require("./redis");
const createKeyPrefix = (platform) => `${config_1.default.deploymentEnv}:${platform}`;
const createReplicaCountKey = (platform) => `${createKeyPrefix(platform)}:replicaCount`;
async function getReplicaCount(maybePlatform) {
    const platform = maybePlatform || config_1.default.platform;
    const redis = await redis_1.getRedisClient(redis_1.RedisClient.Configuration);
    const result = await redis.get(createReplicaCountKey(platform));
    return result === null ? null : Number(result);
}
exports.getReplicaCount = getReplicaCount;
//# sourceMappingURL=metadata.js.map