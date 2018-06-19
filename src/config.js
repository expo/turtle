import path from 'path';

import { env, envNum, envOptional, envTransform } from 'turtle/utils/env';

const turtleMode = env('TURTLE_MODE', 'online');
let shouldExit = false;

export const setShouldExit = () => {
  shouldExit = true;
};

export const checkShouldExit = () => {
  return shouldExit;
};

export const isOffline = () => turtleMode === 'offline';

export default {
  env: env('NODE_ENV'),
  deploymentEnv: env('ENVIRONMENT'),
  platform: env('PLATFORM', 'ios'),
  aws: {
    accessKeyId: env('AWS_ACCESS_KEY_ID'),
    secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
  },
  s3: {
    bucket: env('AWS_S3_BUCKET'),
    region: env('AWS_S3_REGION'),
  },
  sqs: {
    region: env('AWS_SQS_REGION'),
    queues: {
      ios: env('AWS_SQS_IOS_QUEUE_URL'),
      android: env('AWS_SQS_ANDROID_QUEUE_URL'),
      out: env('AWS_SQS_OUT_QUEUE_URL'),
    },
  },
  logger: {
    level: env('LOGGER_LEVEL', 'info'),
    interval: envNum('LOGGER_INTERVAL', 5),
    client: {
      level: env('CLIENT_LOGGER_LEVEL', 'info'),
    },
    loggly: {
      token: env('LOGGLY_TOKEN', ''),
      subdomain: env('LOGGLY_SUBDOMAIN', ''),
      buffer: envNum('LOGGLY_BUFFER', 100),
    },
  },
  sentry: {
    dsn: env('SENTRY_DSN', ''),
  },
  api: {
    protocol: env('API_PROTOCOL'),
    hostname: env('API_HOSTNAME'),
    port: envNum('API_PORT'),
  },
  builder: {
    mode: turtleMode,
    workingDir: env('TURTLE_WORKING_DIR_PATH', path.join(process.cwd(), 'workingdir')),
    temporaryFilesRoot: env('TURTLE_TEMPORARY_FILES_DIR', path.join('/private', 'tmp', 'turtle')),
    skipCleanup: envTransform(
      'TURTLE_SKIP_CLEANUP',
      '0',
      val => env('NODE_ENV') === 'development' && val === '1'
    ),
    fakeUpload: envTransform('TURTLE_FAKE_UPLOAD', '0', val => val === '1'),
    fakeUploadDir: envOptional('TURTLE_FAKE_UPLOAD_DIR'),
    exitOnReceiveError: env('TURTLE_EXIT_ON_RECEIVE_ERROR', '1'),
  },
};
