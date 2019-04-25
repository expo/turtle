import config from 'turtle/config';

// type error when using import
// https://github.com/googleapis/nodejs-logging-bunyan/issues/241
// tslint:disable-next-line:no-var-requires
const { LoggingBunyan } = require('@google-cloud/logging-bunyan');

export default function create() {
  if (!config.google.credentials) {
    return null;
  }

  const gcloudStream = new LoggingBunyan({
    name: 'turtle',
    resource: {
      type: 'generic_node',
      labels: {
        node_id: config.hostname,
        location: '', // default value
        namespace: '', // default value
      },
    },
  });
  return {
    level: 'info',
    type: 'raw',
    stream: gcloudStream,
  };
}
