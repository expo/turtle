"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const groupBy_1 = __importDefault(require("lodash/groupBy"));
const mapValues_1 = __importDefault(require("lodash/mapValues"));
const take_1 = __importDefault(require("lodash/take"));
const logger_1 = __importDefault(require("../logger"));
const datadog_1 = require("./datadog");
const metadata_1 = require("../utils/metadata");
const priorities_1 = require("../utils/priorities");
const createMetricName = () => `turtle.replicaCount`;
const createModeMetricName = (mode) => `${createMetricName()}.${mode}`;
const createModeTag = (mode) => `mode:${mode}`;
async function sendConfigToDatadog() {
    let configuration;
    try {
        configuration = await priorities_1.getLabeledConfiguration();
    }
    catch (err) {
        logger_1.default.warn('Failed to send the builders configuration to Datadog because it couldn\'t be fetched from Redis');
        return;
    }
    const replicaCount = await metadata_1.getReplicaCount();
    const currentReplicaCount = replicaCount === null ? configuration.length : replicaCount;
    const replicaCounts = mapValues_1.default(groupBy_1.default(take_1.default(configuration, currentReplicaCount)), (i) => i.length);
    const metricName = createMetricName();
    const normalReplicaCount = replicaCounts[priorities_1.TurtleModeLabels.Normal] || 0;
    const highReplicaCount = replicaCounts[priorities_1.TurtleModeLabels.High] || 0;
    const highOnlyReplicaCount = replicaCounts[priorities_1.TurtleModeLabels.HighOnly] || 0;
    const normalTag = createModeTag(priorities_1.TurtleModeLabels.Normal);
    const normalMetricName = createModeMetricName(priorities_1.TurtleModeLabels.Normal);
    logger_1.default.debug(`Sending ${metricName}=${normalReplicaCount} (${normalTag}), ${normalMetricName}=${normalReplicaCount} to Datadog`);
    await datadog_1.sendMetric(metricName, normalReplicaCount, [normalTag]);
    await datadog_1.sendMetric(normalMetricName, normalReplicaCount);
    const highTag = createModeTag(priorities_1.TurtleModeLabels.High);
    const highMetricName = createModeMetricName(priorities_1.TurtleModeLabels.High);
    logger_1.default.debug(`Sending ${metricName}=${highReplicaCount} (${highTag}), ${highMetricName}=${highReplicaCount} to Datadog`);
    await datadog_1.sendMetric(metricName, highReplicaCount, [highTag]);
    await datadog_1.sendMetric(highMetricName, highReplicaCount);
    const highOnlyTag = createModeTag(priorities_1.TurtleModeLabels.HighOnly);
    const highOnlyMetricName = createModeMetricName(priorities_1.TurtleModeLabels.HighOnly);
    logger_1.default.debug(`Sending ${metricName}=${highOnlyReplicaCount} (${highOnlyTag}),`
        + ` ${highOnlyMetricName}=${highOnlyReplicaCount} to Datadog`);
    await datadog_1.sendMetric(metricName, highOnlyReplicaCount, [highOnlyTag]);
    await datadog_1.sendMetric(highOnlyMetricName, highOnlyReplicaCount);
}
exports.default = sendConfigToDatadog;
//# sourceMappingURL=buildersConfig.js.map