import * as cloudwatch from 'turtle/aws/cloudwatch';
import logger from 'turtle/logger';
import * as buildDuration from 'turtle/metrics/buildDuration';
import * as buildStatus from 'turtle/metrics/buildStatus';

const metricsToRegister = [buildStatus, buildDuration];

export async function init() {
  logger.info('Initializing Cloudwatch metrics');
  await cloudwatch.init();
  metricsToRegister.forEach((metric) => metric.register());
}
