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
const isLocal = env => env === 'local';
const isStaging = env => env === 'staging';

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
  TURTLE_USE_LOCAL_WORKING_DIR: '1',
  TURTLE_FAKE_UPLOAD: '1',
  // TODO: temporary, change me
  TURTLE_FAKE_UPLOAD_DIR: '/Users/dsokal/Downloads',
};

export function initOfflineEnv() {
  _.map(OFFLINE_ENV_VARS, (val, key) => {
    process.env[key] = val;
  });
}
