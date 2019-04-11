import * as cloudwatch from 'turtle/aws/cloudwatch';
import { TYPE_DIMENSIONS } from 'turtle/aws/cloudwatch/dimensions';
import * as reducers from 'turtle/aws/cloudwatch/reducers';
import config from 'turtle/config';

const BUILD_METRIC_NAME = 'build';

export function register(logger: any) {
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

export function add(type: string, success = true) {
  cloudwatch.addMetricData({
    name: BUILD_METRIC_NAME,
    value: 1,
    success,
    extraDimensions: TYPE_DIMENSIONS(type),
  });
}
