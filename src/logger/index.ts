import bunyan from 'bunyan';
import bunyanDebugStream from 'bunyan-debug-stream';
import { SentryStream } from 'bunyan-sentry-stream';
import { Client as RavenClient } from 'raven';

import config from 'turtle/config';
import { IJob } from 'turtle/job';
import S3Stream from 'turtle/logger/s3Stream';
import { isOffline } from 'turtle/turtleContext';

// type error when using import
// https://github.com/googleapis/nodejs-logging-bunyan/issues/241
// tslint:disable-next-line:no-var-requires
const { LoggingBunyan } = require('@google-cloud/logging-bunyan');

interface IStream {
  stream: any;
  type?: string;
  level?: string;
  reemitErrorEvents?: boolean;
}

export const s3logger = new S3Stream();

const streams: IStream[] = [];

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
    },
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

if (config.google.credentials) {
  const resource = {
    type: 'generic_node',
    labels: {
      node_id: config.hostname,
      location: '', // default value
      namespace: '', // default value
    },
  };
  streams.push(new LoggingBunyan({ name: 'turtle', resource }).stream('info'));
}

const logger = bunyan.createLogger({
  name: 'turtle',
  level: config.logger.level,
  platform: config.platform,
  environment: config.deploymentEnv,
  streams,
});

logger.init = async (job: IJob) => {
  return await s3logger.init(job);
};

logger.cleanup = async () => {
  // a little hacky, but works
  logger.info({ lastBuildLog: true }, 'this is the last log from this build');
  await s3logger.waitForLogger();
};

export default logger;
