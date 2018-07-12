import bunyan from 'bunyan';
import { Client as RavenClient } from 'raven';
import { SentryStream } from 'bunyan-sentry-stream';
import bunyanDebugStream from 'bunyan-debug-stream';

import config from 'turtle/config';
import S3Stream from 'turtle/logger/s3Stream';
import HackyLogglyStream from 'turtle/logger/hackyLogglyStream';
import * as constants from 'turtle/constants/logger';
import { isOffline } from 'turtle/turtleContext';

export const s3logger = new S3Stream();
let logglyStream;

const streams = [];

if (isOffline()) {
  const prettyStdOut = new bunyanDebugStream({ forceColor: true });
  streams.push({ stream: prettyStdOut, type: 'raw', level: config.logger.client.level });
} else {
  streams.push(
    { stream: process.stdout },
    {
      type: 'raw',
      stream: s3logger,
      reemitErrorEvents: true,
      level: config.logger.client.level,
    }
  );
}

if (config.sentry.dsn && config.deploymentEnv !== 'development') {
  const raven = new RavenClient();
  raven.config(config.sentry.dsn, { environment: config.deploymentEnv });
  streams.push({
    level: 'error',
    type: 'raw', // Mandatory type for SentryStream
    stream: new SentryStream(raven),
  });
}

if (config.logger.loggly.token) {
  const logglyConfig = {
    token: config.logger.loggly.token,
    subdomain: config.logger.loggly.subdomain,
    // prettier-ignore
    tags: [
      'app-shell-apps',
      `platform.${config.platform}`,
      `environment.${config.deploymentEnv}`,
    ],
  };
  logglyStream = new HackyLogglyStream(logglyConfig);
  streams.push({
    type: 'raw',
    stream: logglyStream,
  });
}

const logger = bunyan.createLogger({
  name: 'turtle',
  level: config.logger.level,
  streams,
});

logger.withFields = extraFields => withFields(logger, extraFields);

logger.init = async job => {
  if (logglyStream) {
    logglyStream.init(job);
  }
  return await s3logger.init(job);
};

logger.cleanup = async () => {
  // a little hacky, but works
  logger.info({ lastBuildLog: true }, 'this is the last log from this build');
  if (logglyStream) {
    logglyStream.cleanup();
  }
  await s3logger.waitForLogger();
};

export default logger;

export function withFields(logger, extraFields) {
  return constants.LEVELS.reduce((obj, level) => {
    obj[level] = (...args) => logger[level](extraFields, ...args);
    return obj;
  }, {});
}
