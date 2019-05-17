import groupBy from 'lodash/groupBy';
import mapValues from 'lodash/mapValues';
import take from 'lodash/take';

import logger from 'turtle/logger';
import { sendMetric } from 'turtle/metrics/datadog';
import { getReplicaCount } from 'turtle/utils/metadata';
import { getLabeledConfiguration, TurtleModeLabels } from 'turtle/utils/priorities';

const createMetricName = () => `turtle.replicaCount`;
const createModeMetricName = (mode: TurtleModeLabels) => `${createMetricName()}.${mode}`;
const createModeTag = (mode: TurtleModeLabels) => `mode:${mode}`;

export default async function sendConfigToDatadog() {
  const configuration = await getLabeledConfiguration();
  const replicaCount = await getReplicaCount();

  const replicaCounts = mapValues(
    groupBy<string>(take(configuration, replicaCount)),
    (i) => i.length,
  );

  const metricName = createMetricName();

  const normalReplicaCount = replicaCounts[TurtleModeLabels.Normal] || 0;
  const highReplicaCount = replicaCounts[TurtleModeLabels.High] || 0;
  const highOnlyReplicaCount = replicaCounts[TurtleModeLabels.HighOnly] || 0;

  const normalTag = createModeTag(TurtleModeLabels.Normal);
  const normalMetricName = createModeMetricName(TurtleModeLabels.Normal);
  logger.debug(
    `Sending ${metricName}=${normalReplicaCount} (${normalTag}), ${normalMetricName}=${normalReplicaCount} to Datadog`,
  );
  await sendMetric(metricName, normalReplicaCount, [normalTag]);
  await sendMetric(normalMetricName, normalReplicaCount);

  const highTag = createModeTag(TurtleModeLabels.High);
  const highMetricName = createModeMetricName(TurtleModeLabels.High);
  logger.debug(
    `Sending ${metricName}=${highReplicaCount} (${highTag}), ${highMetricName}=${highReplicaCount} to Datadog`,
  );
  await sendMetric(metricName, highReplicaCount, [highTag]);
  await sendMetric(highMetricName, highReplicaCount);

  const highOnlyTag = createModeTag(TurtleModeLabels.HighOnly);
  const highOnlyMetricName = createModeMetricName(TurtleModeLabels.HighOnly);
  logger.debug(
    `Sending ${metricName}=${highOnlyReplicaCount} (${highOnlyTag}),`
    + ` ${highOnlyMetricName}=${highOnlyReplicaCount} to Datadog`,
  );
  await sendMetric(metricName, highOnlyReplicaCount, [highOnlyTag]);
  await sendMetric(highOnlyMetricName, highOnlyReplicaCount);
}
