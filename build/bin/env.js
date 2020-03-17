"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const env_1 = require("../utils/env");
const resolveEnv = () => {
    if (env_1.env('EXPO_LOCAL', '0') === '1') {
        return 'local';
    }
    else if (env_1.env('EXPO_STAGING', '0') === '1') {
        return 'staging';
    }
    else {
        return 'production';
    }
};
const currentEnv = resolveEnv();
const isLocal = (envName) => envName === 'local';
const isStaging = (envName) => envName === 'staging';
const apiConfig = {
    protocol: 'https',
    hostname: 'exp.host',
    port: 443,
};
if (isStaging(currentEnv)) {
    apiConfig.hostname = 'staging.exp.host';
}
else if (isLocal(currentEnv)) {
    apiConfig.protocol = 'http';
    apiConfig.hostname = 'localhost';
    apiConfig.port = 3000;
}
const OFFLINE_ENV_VARS = {
    TURTLE_MODE: 'offline',
    API_PROTOCOL: apiConfig.protocol,
    API_HOSTNAME: apiConfig.hostname,
    API_PORT: apiConfig.port,
    TURTLE_FAKE_UPLOAD: '1',
    TURTLE_FAKE_UPLOAD_DIR: path_1.default.join(os_1.default.homedir(), 'expo-apps'),
    TURTLE_WORKING_DIR_PATH: path_1.default.join(os_1.default.homedir(), '.turtle/workingdir'),
    EXPO_SKIP_SOURCING: '1',
};
function initOfflineEnv() {
    lodash_1.default.map(OFFLINE_ENV_VARS, (val, key) => {
        process.env[key] = String(val);
    });
}
exports.initOfflineEnv = initOfflineEnv;
//# sourceMappingURL=env.js.map