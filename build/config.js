"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("./constants");
const env_1 = require("./utils/env");
exports.default = {
    env: env_1.env('NODE_ENV'),
    hostname: env_1.env('HOSTNAME', os_1.default.hostname()),
    deploymentEnv: env_1.env('ENVIRONMENT'),
    platform: env_1.env('PLATFORM', constants_1.PLATFORMS.IOS),
    aws: {
        accessKeyId: env_1.env('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env_1.env('AWS_SECRET_ACCESS_KEY'),
    },
    s3: {
        bucket: env_1.env('AWS_S3_BUCKET'),
        region: env_1.env('AWS_S3_REGION'),
    },
    sqs: {
        region: env_1.env('AWS_SQS_REGION'),
        queues: {
            normalPriority: {
                ios: env_1.env('AWS_SQS_IOS_QUEUE_URL'),
                android: env_1.env('AWS_SQS_ANDROID_QUEUE_URL'),
            },
            highPriority: {
                ios: env_1.env('AWS_SQS_IOS_PRIORITY_QUEUE_URL'),
                android: env_1.env('AWS_SQS_ANDROID_PRIORITY_QUEUE_URL'),
            },
            out: env_1.env('AWS_SQS_OUT_QUEUE_URL'),
        },
    },
    cloudwatch: {
        region: env_1.env('AWS_CLOUDWATCH_REGION'),
        disabled: env_1.envTransform('AWS_CLOUDWATCH_DISABLED', '0', (val) => val === '1'),
        intervalMs: env_1.envNum('AWS_CLOUDWATCH_INTERVAL_MS', 30000),
        namespace: env_1.env('AWS_CLOUDWATCH_NAMESPACE', 'Turtle'),
    },
    datadog: {
        disabled: env_1.envBoolean('DATADOG_DISABLED', false),
        apiKey: env_1.envOptional('DATADOG_API_KEY'),
        appKey: env_1.envOptional('DATADOG_APP_KEY'),
        intervalMs: env_1.env('DATADOG_INTERVAL_MS', 5 * 60 * 1000),
    },
    redis: {
        url: env_1.env('REDIS_URL'),
        configUrl: env_1.env('REDIS_CONFIG_URL'),
    },
    logger: {
        level: env_1.env('LOGGER_LEVEL', 'info'),
        intervalMs: env_1.envNum('LOGGER_INTERVAL_MS', 5000),
    },
    google: {
        credentials: env_1.env('GOOGLE_APPLICATION_CREDENTIALS', ''),
    },
    sentry: {
        dsn: env_1.env('SENTRY_DSN', ''),
    },
    api: {
        protocol: env_1.env('API_PROTOCOL'),
        hostname: env_1.env('API_HOSTNAME'),
        port: env_1.envNum('API_PORT'),
    },
    builder: {
        mode: env_1.env('TURTLE_MODE', 'online'),
        skipCleanup: env_1.envTransform('TURTLE_SKIP_CLEANUP', '0', (val) => env_1.env('NODE_ENV') === 'development' && val === '1'),
        fakeUpload: env_1.envTransform('TURTLE_FAKE_UPLOAD', '0', (val) => val === '1'),
        maxJobTimeMs: env_1.envNum('TURTLE_MAX_JOB_TIME_MS', 15 * 60 * 1000),
        useLocalWorkingDir: env_1.envTransform('TURTLE_USE_LOCAL_WORKING_DIR', '0', (val) => val === '1'),
    },
    directories: {
        rootDir: env_1.env('TURTLE_ROOT_DIR_PATH', path_1.default.join(__dirname, '..')),
        workingDir: env_1.env('TURTLE_WORKING_DIR_PATH', path_1.default.join(__dirname, '../workingdir')),
        shellTarballsDir: env_1.env('TURTLE_SHELL_TARBALLS_DIR', path_1.default.join(__dirname, '../shellTarballs')),
        artifactsDir: env_1.env('TURTLE_ARTIFACTS_DIR', path_1.default.join(__dirname, '../artifacts')),
        androidDependenciesDir: env_1.env('TURTLE_ANDROID_DEPENDENCIES_DIR', path_1.default.join(os_1.default.homedir(), '.turtle/androidDependencies')),
        tempS3LogsDir: env_1.env('TURTLE_TEMP_S3_LOGS_DIR', '/tmp/logs'),
        fakeUploadDir: env_1.envOptional('TURTLE_FAKE_UPLOAD_DIR'),
        temporaryFilesRoot: env_1.env('TURTLE_TEMPORARY_FILES_DIR', path_1.default.join(os_1.default.platform() === 'darwin' ? '/private' : '/', 'tmp', 'turtle')),
    },
    www: {
        sdkVersionsSecretToken: env_1.env('TURTLE_SDK_VERSIONS_SECRET_TOKEN'),
    },
};
//# sourceMappingURL=config.js.map