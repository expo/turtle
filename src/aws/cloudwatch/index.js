import aws from 'aws-sdk';
import _ from 'lodash';

import config from 'turtle/config';
import logger from 'turtle/logger';
import calculateStatistics from 'turtle/aws/cloudwatch/statistics';

const EXTRA_DIMENSIONS = Symbol('Extra Dimensions');
const GROUP_HASH = Symbol('Group Hash');

const SUCCESS_SUFFIX = '.success';
const FAIL_SUFFIX = '.fail';
const CHUNK_SIZE = 20;

const state = {
  metrics: [],
  registeredMetrics: {},
  intervalId: null,
};

const cloudWatch = new aws.CloudWatch({
  apiVersion: '2010-08-01',
  region: config.cloudwatch.region,
  accessKeyId: config.aws.access,
  secretAccessKey: config.aws.secret,
});

export function init() {
  if (config.cloudwatch.disabled) {
    return;
  }

  state.intervalId = setInterval(_dumpMetrics, config.cloudwatch.intervalMs);
}

export function addMetricData({
  name,
  value,
  success = true,
  explicitName = false,
  extraDimensions = [],
}) {
  if (config.cloudwatch.disabled) {
    return;
  }

  const metricName = explicitName ? name : _createMetricName(name, success);
  const registeredMetric = state.registeredMetrics[metricName];
  if (!registeredMetric) {
    return;
  }
  const { unit } = registeredMetric;
  const metric = {
    MetricName: metricName,
    Unit: unit,
    Value: value,
    Timestamp: new Date(),
    [EXTRA_DIMENSIONS]: extraDimensions,
    [GROUP_HASH]: _calculateGroupHash(metricName, extraDimensions),
  };
  state.metrics.push(metric);
}

export function registerMetric({
  metricName,
  unit,
  reducer,
  dimensions = [],
  statistics = false,
  addEmpty = true,
  explicitName = false,
}) {
  if (config.cloudwatch.disabled) {
    return;
  }

  const successMetricName = _createMetricName(metricName, true, explicitName);
  state.registeredMetrics[successMetricName] = { unit, statistics, reducer, addEmpty, dimensions };
  if (!explicitName) {
    const failMetricName = _createMetricName(metricName, false);
    state.registeredMetrics[failMetricName] = { unit, statistics, reducer, addEmpty, dimensions };
  }
}

function _createMetricName(name, success, explicitName) {
  if (explicitName) {
    return name;
  } else {
    const suffix = success ? SUCCESS_SUFFIX : FAIL_SUFFIX;
    return `${name}${suffix}`;
  }
}

function _calculateGroupHash(metricName, extraDimensions) {
  const dimString = _.flatten(extraDimensions)
    .map(({ Name, Value }) => `,${Name}:${Value}`)
    .join('');
  return `${metricName}${dimString}`;
}

function _dumpMetrics() {
  if (!state.metrics.length && state.registeredMetrics.size < 0) {
    // empty metrics list, skipping
    return;
  }

  logger.trace(
    '[cloudwatch] lenghts for state.metrics=%d, state.registeredMetrics=%d',
    state.metrics.length,
    Object.keys(state.registeredMetrics).length
  );

  _addEmptyMetrics(state.metrics);
  const formattedMetrics = _formatMetrics(state.metrics);
  _pushMetrics(formattedMetrics);

  state.metrics = [];
}

function _addEmptyMetrics(metrics) {
  const seenMetrics = metrics.reduce((acc, i) => {
    if (!acc.has(i.MetricName)) {
      acc.add(i.MetricName);
    }
    return acc;
  }, new Set());

  const nonEmptyMetrics = _.omitBy(state.registeredMetrics, ({ addEmpty }) => !addEmpty);
  const toAdd = _.difference(Object.keys(nonEmptyMetrics), Array.from(seenMetrics));
  toAdd.forEach(name => addMetricData({ name, value: 0, explicitName: true }));
}

function _formatMetrics(metrics) {
  const reducedMetrics = _reduceMetrics(metrics);
  const metricsWithDimensions = reducedMetrics.map(metric => {
    const { dimensions } = state.registeredMetrics[metric.MetricName];
    const joinedDimensions = [...dimensions, ...metric[EXTRA_DIMENSIONS]];
    return joinedDimensions.map(i => Object.assign({}, metric, { Dimensions: i }));
  });
  const metricData = _.flatten(metricsWithDimensions);
  const chunks = _.chunk(metricData, CHUNK_SIZE);
  return chunks.map(chunk => ({
    Namespace: config.cloudwatch.namespace,
    MetricData: chunk,
  }));
}

function _reduceMetrics(metrics) {
  const grouped = _.groupBy(metrics, GROUP_HASH);
  return _.reduce(
    grouped,
    (acc, val) => {
      const { MetricName: key } = val[0];
      const { reducer, statistics } = state.registeredMetrics[key];
      const reduced = reducer ? reducer(val) : val;
      const withStats = statistics ? calculateStatistics(reduced) : reduced;
      acc.push(...withStats);
      return acc;
    },
    []
  );
}

function _pushMetrics(metrics) {
  logger.trace('[cloudwatch] pushing metrics', JSON.stringify(metrics, null, '\t'));
  metrics.forEach(metricsChunk => {
    cloudWatch.putMetricData(metricsChunk, err => {
      if (err) {
        logger.warn('[cloudwatch]', err);
      }
    });
  });
}
