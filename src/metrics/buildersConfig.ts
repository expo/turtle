import groupBy from 'lodash/groupBy';
import mapValues from 'lodash/mapValues';
import take from 'lodash/take';

import logger from 'turtle/logger';
import { sendMetric } from 'turtle/metrics/datadog';
import { getReplicaCount } from 'turtle/utils/metadata';
import { getLabeledConfiguration, TurtleMode } from 'turtle/utils/priorities';

const createMetricName = () => `turtle.replicaCount`;
const createModeMetricName = (mode: TurtleMode) => `${createMetricName()}.${mode}`;
const createModeTag = (mode: TurtleMode) => `mode:${mode}`;

export default async function sendConfigToDatadog() {
  let configuration;
  try {
    configuration = await getLabeledConfiguration();
  } catch (err) {
    logger.warn('Failed to send the builders configuration to Datadog because it couldn\'t be fetched from Redis');
    return;
  }

  const replicaCount = await getReplicaCount();
  const currentReplicaCount = replicaCount === null ? configuration.length : replicaCount;

  const replicaCounts = mapValues(
    groupBy<string>(take(configuration, currentReplicaCount)),
    (i) => i.length,
  );

  const metricName = createMetricName();

  const normalReplicaCount = replicaCounts[TurtleMode.Normal] || 0;
  const highReplicaCount = replicaCounts[TurtleMode.High] || 0;
  const highOnlyReplicaCount = replicaCounts[TurtleMode.HighOnly] || 0;

  const normalTag = createModeTag(TurtleMode.Normal);
  const normalMetricName = createModeMetricName(TurtleMode.Normal);
  logger.debug(
    `Sending ${metricName}=${normalReplicaCount} (${normalTag}), ${normalMetricName}=${normalReplicaCount} to Datadog`,
  );
  await sendMetric(metricName, normalReplicaCount, [normalTag]);
  await sendMetric(normalMetricName, normalReplicaCount);

  const highTag = createModeTag(TurtleMode.High);
  const highMetricName = createModeMetricName(TurtleMode.High);
  logger.debug(
    `Sending ${metricName}=${highReplicaCount} (${highTag}), ${highMetricName}=${highReplicaCount} to Datadog`,
  );
  await sendMetric(metricName, highReplicaCount, [highTag]);
  await sendMetric(highMetricName, highReplicaCount);

  const highOnlyTag = createModeTag(TurtleMode.HighOnly);
  const highOnlyMetricName = createModeMetricName(TurtleMode.HighOnly);
  logger.debug(
    `Sending ${metricName}=${highOnlyReplicaCount} (${highOnlyTag}),`
    + ` ${highOnlyMetricName}=${highOnlyReplicaCount} to Datadog`,
  );
  await sendMetric(metricName, highOnlyReplicaCount, [highOnlyTag]);
  await sendMetric(highOnlyMetricName, highOnlyReplicaCount);
}
