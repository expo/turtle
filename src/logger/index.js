import bunyan from 'bunyan';
import { Client as RavenClient } from 'raven';
import sentryStream from 'bunyan-sentry-stream';
import bunyanDebugStream from 'bunyan-debug-stream';

import config, { isOffline } from 'turtle/config';
import S3Stream from 'turtle/logger/s3Stream';
import HackyLogglyStream from 'turtle/logger/hackyLogglyStream';
import * as constants from 'turtle/constants/logger';

export const s3logger = new S3Stream();

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

if (config.sentry.dsn) {
  const sentryClient = new RavenClient(config.sentry.dsn);
  streams.push(sentryStream(sentryClient));
}

if (config.logger.loggly.token) {
  const logglyConfig = {
    token: config.logger.loggly.token,
    subdomain: config.logger.loggly.subdomain,
    // prettier-ignore
    tags: [
      'app-shell-apps',
      `platform.${config.platform}`,
      `environment.${config.env}`,
    ],
  };
  streams.push({
    type: 'raw',
    stream: new HackyLogglyStream(logglyConfig),
  });
}

const logger = bunyan.createLogger({
  name: 'turtle',
  level: config.logger.level,
  streams,
});
logger.withFields = extraFields => withFields(logger, extraFields);

export default logger;

export function withFields(logger, extraFields) {
  return constants.LEVELS.reduce((obj, level) => {
    obj[level] = (...args) => logger[level](extraFields, ...args);
    return obj;
  }, {});
}
