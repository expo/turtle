"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const lodash_1 = __importDefault(require("lodash"));
const constants_1 = require("./constants");
const statistics_1 = __importDefault(require("./statistics"));
const config_1 = __importDefault(require("../../config"));
const logger_1 = __importDefault(require("../../logger"));
const SUCCESS_SUFFIX = '.success';
const FAIL_SUFFIX = '.fail';
const CHUNK_SIZE = 20;
const state = {
    metrics: [],
    registeredMetrics: {},
    intervalId: null,
};
const cloudWatch = new aws_sdk_1.default.CloudWatch({
    apiVersion: '2010-08-01',
    region: config_1.default.cloudwatch.region,
    accessKeyId: config_1.default.aws.accessKeyId,
    secretAccessKey: config_1.default.aws.secretAccessKey,
});
function init() {
    if (config_1.default.cloudwatch.disabled) {
        return;
    }
    state.intervalId = setInterval(_dumpMetrics, config_1.default.cloudwatch.intervalMs);
}
exports.init = init;
function addMetricData({ name, value, success = true, explicitName = false, extraDimensions = [], }) {
    if (config_1.default.cloudwatch.disabled) {
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
        [constants_1.EXTRA_DIMENSIONS]: extraDimensions,
        [constants_1.GROUP_HASH]: _calculateGroupHash(metricName, extraDimensions),
    };
    state.metrics.push(metric);
}
exports.addMetricData = addMetricData;
function registerMetric({ metricName, unit, reducer, dimensions = [], statistics = false, addEmpty = true, explicitName = false, }) {
    if (config_1.default.cloudwatch.disabled) {
        return;
    }
    const successMetricName = _createMetricName(metricName, true, explicitName);
    state.registeredMetrics[successMetricName] = { unit, statistics, reducer, addEmpty, dimensions };
    if (!explicitName) {
        const failMetricName = _createMetricName(metricName, false);
        state.registeredMetrics[failMetricName] = { unit, statistics, reducer, addEmpty, dimensions };
    }
}
exports.registerMetric = registerMetric;
function _createMetricName(name, success, explicitName) {
    if (explicitName) {
        return name;
    }
    else {
        const suffix = success ? SUCCESS_SUFFIX : FAIL_SUFFIX;
        return `${name}${suffix}`;
    }
}
function _calculateGroupHash(metricName, extraDimensions) {
    const dimString = lodash_1.default.flatten(extraDimensions)
        .map(({ Name, Value }) => `,${Name}:${Value}`)
        .join('');
    return `${metricName}${dimString}`;
}
function _dumpMetrics() {
    if (!state.metrics.length && Object.keys(state.registeredMetrics).length < 0) {
        // empty metrics list, skipping
        return;
    }
    logger_1.default.trace('[cloudwatch] lenghts for state.metrics=%d, state.registeredMetrics=%d', state.metrics.length, Object.keys(state.registeredMetrics).length);
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
    const nonEmptyMetrics = lodash_1.default.omitBy(state.registeredMetrics, ({ addEmpty }) => !addEmpty);
    const toAdd = lodash_1.default.difference(Object.keys(nonEmptyMetrics), Array.from(seenMetrics));
    toAdd.forEach((name) => addMetricData({ name, value: 0, explicitName: true }));
}
function _formatMetrics(metrics) {
    const reducedMetrics = _reduceMetrics(metrics);
    const metricsWithDimensions = reducedMetrics.map((metric) => {
        const { dimensions } = state.registeredMetrics[metric.MetricName];
        const joinedDimensions = [...dimensions, ...metric[constants_1.EXTRA_DIMENSIONS]];
        return joinedDimensions.map((i) => Object.assign({}, metric, { Dimensions: i }));
    });
    const metricData = lodash_1.default.flatten(metricsWithDimensions);
    const chunks = lodash_1.default.chunk(metricData, CHUNK_SIZE);
    return chunks.map((chunk) => ({
        Namespace: config_1.default.cloudwatch.namespace,
        MetricData: chunk,
    }));
}
function _reduceMetrics(metrics) {
    const grouped = lodash_1.default.groupBy(metrics, constants_1.GROUP_HASH);
    return lodash_1.default.reduce(grouped, (acc, val) => {
        const { MetricName: key } = val[0];
        const { reducer, statistics } = state.registeredMetrics[key];
        const reduced = reducer ? reducer(val) : val;
        const withStats = statistics ? statistics_1.default(reduced) : reduced;
        acc.push(...withStats);
        return acc;
    }, []);
}
function _pushMetrics(metrics) {
    logger_1.default.trace('[cloudwatch] pushing metrics', JSON.stringify(metrics, null, '\t'));
    metrics.forEach((metricsChunk) => {
        cloudWatch.putMetricData(metricsChunk, (err) => {
            if (err) {
                logger_1.default.warn({ err }, '[cloudwatch]');
            }
        });
    });
}
//# sourceMappingURL=index.js.map