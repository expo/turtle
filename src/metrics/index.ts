import logger from 'turtle/logger';
import * as cloudwatch from 'turtle/aws/cloudwatch';
import * as buildStatus from 'turtle/metrics/buildStatus';
import * as buildDuration from 'turtle/metrics/buildDuration';

const metricsToRegister = [buildStatus, buildDuration];

export async function init() {
  logger.info('Initializing Cloudwatch metrics');
  await cloudwatch.init();
  metricsToRegister.forEach(metric => metric.register());
}
