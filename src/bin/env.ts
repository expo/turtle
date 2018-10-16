import path from 'path';
import os from 'os';

import _ from 'lodash';

import { env } from 'turtle/utils/env';

const resolveEnv = () => {
  if (env('EXPO_LOCAL', '0') === '1') {
    return 'local';
  } else if (env('EXPO_STAGING', '0') === '1') {
    return 'staging';
  } else {
    return 'production';
  }
};

const currentEnv = resolveEnv();
const isLocal = (env: string) => env === 'local';
const isStaging = (env: string) => env === 'staging';

const apiConfig = {
  protocol: 'https',
  hostname: 'exp.host',
  port: 443,
};

if (isStaging(currentEnv)) {
  apiConfig.hostname = 'staging.exp.host';
} else if (isLocal(currentEnv)) {
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
  TURTLE_FAKE_UPLOAD_DIR: path.join(os.homedir(), 'expo-apps'),
  TURTLE_WORKING_DIR_PATH: path.join(os.homedir(), '.turtle/workingdir'),
  EXPO_SKIP_SOURCING: '1',
};

export function initOfflineEnv() {
  _.map(OFFLINE_ENV_VARS, (val, key) => {
    process.env[key] = String(val);
  });
}
