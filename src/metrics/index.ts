import * as cloudwatch from 'turtle/aws/cloudwatch';
import * as buildDuration from 'turtle/metrics/buildDuration';
import * as buildStatus from 'turtle/metrics/buildStatus';

const metricsToRegister = [buildStatus, buildDuration];

export async function init(logger: any) {
  logger.info('Initializing Cloudwatch metrics');
  await cloudwatch.init(logger);
  metricsToRegister.forEach((metric) => metric.register(logger));
}
