import * as cloudwatch from 'turtle/aws/cloudwatch';
import { TYPE_DIMENSIONS } from 'turtle/aws/cloudwatch/dimensions';

const TURTLE_BUILD_DURATION_METRIC_NAME = 'turtleBuildDuration';
const TOTAL_BUILD_DURATION_METRIC_NAME = 'totalBuildDuration';

export function register(logger: any) {
  for (const metricName of [TURTLE_BUILD_DURATION_METRIC_NAME, TOTAL_BUILD_DURATION_METRIC_NAME]) {
    logger.info(`Registered AWS Cloudwatch metric: ${metricName}`);
    cloudwatch.registerMetric({
      metricName,
      unit: 'Seconds',
      statistics: true,
    });
  }
}

export function addTurtleDuration(type: string, value: number, success = true) {
  cloudwatch.addMetricData({
    name: TURTLE_BUILD_DURATION_METRIC_NAME,
    value,
    success,
    extraDimensions: TYPE_DIMENSIONS(type),
  });
}

export function addTotalDuration(type: string, value: number, success = true) {
  cloudwatch.addMetricData({
    name: TOTAL_BUILD_DURATION_METRIC_NAME,
    value,
    success,
    extraDimensions: TYPE_DIMENSIONS(type),
  });
}
