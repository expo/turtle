import { SentryStream } from 'bunyan-sentry-stream';
import { Client as RavenClient } from 'raven';

import config from 'turtle/config';

export default function create() {
  if (!config.sentry.dsn || config.deploymentEnv === 'development') {
    return null;
  }

  const raven = new RavenClient();
  raven.config(config.sentry.dsn, { environment: config.deploymentEnv });
  return {
    level: 'error',
    type: 'raw', // Mandatory type for SentryStream
    stream: new SentryStream(raven),
  };
}
