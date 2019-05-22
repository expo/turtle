import bunyanDebugStream from 'bunyan-debug-stream';
import config from 'turtle/config';

export default function create() {
  const prettyStdOut = new bunyanDebugStream({ forceColor: true });
  return {
    stream: prettyStdOut,
    type: 'raw',
    level: config.logger.level,
  };
}
