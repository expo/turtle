import os from 'os';
import path from 'path';

import { PLATFORMS } from 'turtle/constants';
import { env, envBoolean, envNum, envOptional, envTransform } from 'turtle/utils/env';

export default {
  env: env('NODE_ENV'),
  hostname: env('HOSTNAME', os.hostname()),
  deploymentEnv: env('ENVIRONMENT'),
  platform: env('PLATFORM', PLATFORMS.IOS) as PLATFORMS,
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
      normalPriority: {
        ios: env('AWS_SQS_IOS_QUEUE_URL'),
        android: env('AWS_SQS_ANDROID_QUEUE_URL'),
      },
      highPriority: {
        ios: env('AWS_SQS_IOS_PRIORITY_QUEUE_URL'),
        android: env('AWS_SQS_ANDROID_PRIORITY_QUEUE_URL'),
      },
      out: env('AWS_SQS_OUT_QUEUE_URL'),
    },
  },
  cloudwatch: {
    region: env('AWS_CLOUDWATCH_REGION'),
    disabled: envTransform('AWS_CLOUDWATCH_DISABLED', '0', (val: string) => val === '1'),
    intervalMs: envNum('AWS_CLOUDWATCH_INTERVAL_MS', 30000),
    namespace: env('AWS_CLOUDWATCH_NAMESPACE', 'Turtle'),
  },
  datadog: {
    disabled: envBoolean('DATADOG_DISABLED', false),
    apiKey: envOptional('DATADOG_API_KEY'),
    appKey: envOptional('DATADOG_APP_KEY'),
    intervalMs: env('DATADOG_INTERVAL_MS', 5 * 60 * 1000),
  },
  redis: {
    url: env('REDIS_URL'),
    configUrl: env('REDIS_CONFIG_URL'),
  },
  logger: {
    level: env('LOGGER_LEVEL', 'info'),
    intervalMs: envNum('LOGGER_INTERVAL_MS', 5000),
  },
  google: {
    credentials: env('GOOGLE_APPLICATION_CREDENTIALS', ''),
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
    mode: env('TURTLE_MODE', 'online'),
    skipCleanup: envTransform(
      'TURTLE_SKIP_CLEANUP',
      '0',
      (val: string) => env('NODE_ENV') === 'development' && val === '1',
    ),
    fakeUpload: envTransform('TURTLE_FAKE_UPLOAD', '0', (val: string) => val === '1'),
    maxJobTimeMs: envNum('TURTLE_MAX_JOB_TIME_MS', 15 * 60 * 1000),
    useLocalWorkingDir: envTransform('TURTLE_USE_LOCAL_WORKING_DIR', '0', (val: string) => val === '1'),
  },
  directories: {
    rootDir: env('TURTLE_ROOT_DIR_PATH', path.join(__dirname, '..')),
    workingDir: env('TURTLE_WORKING_DIR_PATH', path.join(__dirname, '../workingdir')),
    shellTarballsDir: env('TURTLE_SHELL_TARBALLS_DIR', path.join(__dirname, '../shellTarballs')),
    artifactsDir: env('TURTLE_ARTIFACTS_DIR', path.join(__dirname, '../artifacts')),
    androidDependenciesDir: env(
      'TURTLE_ANDROID_DEPENDENCIES_DIR',
      path.join(os.homedir(), '.turtle/androidDependencies'),
      ),
    tempS3LogsDir: env('TURTLE_TEMP_S3_LOGS_DIR', '/tmp/logs'),
    fakeUploadDir: envOptional('TURTLE_FAKE_UPLOAD_DIR'),
    temporaryFilesRoot: env(
      'TURTLE_TEMPORARY_FILES_DIR',
      path.join(os.platform() === 'darwin' ? '/private' : '/', 'tmp', 'turtle'),
    ),
  },
  www: {
    sdkVersionsSecretToken: env('TURTLE_SDK_VERSIONS_SECRET_TOKEN'),
  },
};
