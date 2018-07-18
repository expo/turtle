import config from 'turtle/config';
import logger from 'turtle/logger';
import * as cloudwatch from 'turtle/aws/cloudwatch';
import * as reducers from 'turtle/aws/cloudwatch/reducers';
import { TYPE_DIMENSIONS } from 'turtle/aws/cloudwatch/dimensions';

const BUILD_METRIC_NAME = 'build';

export function register() {
  logger.info(`Registered AWS Cloudwatch metric: ${BUILD_METRIC_NAME}`);
  cloudwatch.registerMetric({
    metricName: BUILD_METRIC_NAME,
    unit: 'Count',
    reducer: reducers.sum,
    dimensions: [
      [{ Name: 'env', Value: config.deploymentEnv }],
      [{ Name: 'env', Value: config.deploymentEnv }, { Name: 'platform', Value: config.platform }],
      [
        { Name: 'env', Value: config.deploymentEnv },
        { Name: 'platform', Value: config.platform },
        { Name: 'host', Value: config.hostname },
      ],
    ],
  });
}

export function add(type, success = true) {
  cloudwatch.addMetricData({
    name: BUILD_METRIC_NAME,
    value: 1,
    success,
    extraDimensions: TYPE_DIMENSIONS(type),
  });
}
