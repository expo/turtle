import bunyan from 'bunyan';
import bunyanDebugStream from 'bunyan-debug-stream';
import { SentryStream } from 'bunyan-sentry-stream';
import { Client as RavenClient } from 'raven';

import config from 'turtle/config';
import * as constants from 'turtle/constants/logger';
import { IJob } from 'turtle/job';
import GCloudStream from 'turtle/logger/gcloudStream';
import S3Stream from 'turtle/logger/s3Stream';
import { isOffline } from 'turtle/turtleContext';

interface IStream {
  stream: any;
  type?: string;
  level?: string;
  reemitErrorEvents?: boolean;
}

export const s3logger = new S3Stream();
let gcloudStream: GCloudStream;

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
  const gcloudConfig = {
    name: 'turtle',
    resource: {
      type: 'generic_node',
      labels: {
        node_id: config.hostname,
        location: '', // default value
        namespace: '', // default value
      },
    },
  };
  gcloudStream = new GCloudStream(gcloudConfig);
  streams.push({
    level: 'info',
    type: 'raw',
    stream: gcloudStream,
  });
}

const logger = bunyan.createLogger({
  name: 'turtle',
  level: config.logger.level,
  platform: config.platform,
  environment: config.deploymentEnv,
  streams,
});

logger.withFields = (extraFields: any) => withFields(logger, extraFields);

logger.init = async (job: IJob) => {
  if (gcloudStream) {
    gcloudStream.init(job);
  }
  return await s3logger.init(job);
};

logger.cleanup = async () => {
  // a little hacky, but works
  logger.info({ lastBuildLog: true }, 'this is the last log from this build');
  if (gcloudStream) {
    gcloudStream.cleanup();
  }
  await s3logger.waitForLogger();
};

export default logger;

export function withFields(loggerObj: any, extraFields: any) {
  return constants.LEVELS.reduce((obj, level) => {
    obj[level] = (...args: any[]) => loggerObj[level](extraFields, ...args);
    return obj;
  }, {} as any);
}
