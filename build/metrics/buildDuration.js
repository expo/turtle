"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudwatch = __importStar(require("../aws/cloudwatch"));
const dimensions_1 = require("../aws/cloudwatch/dimensions");
const logger_1 = __importDefault(require("../logger"));
const TURTLE_BUILD_DURATION_METRIC_NAME = 'turtleBuildDuration';
const TOTAL_BUILD_DURATION_METRIC_NAME = 'totalBuildDuration';
function register() {
    for (const metricName of [TURTLE_BUILD_DURATION_METRIC_NAME, TOTAL_BUILD_DURATION_METRIC_NAME]) {
        logger_1.default.info(`Registered AWS Cloudwatch metric: ${metricName}`);
        cloudwatch.registerMetric({
            metricName,
            unit: 'Seconds',
            statistics: true,
        });
    }
}
exports.register = register;
function addTurtleDuration(type, value, success = true) {
    cloudwatch.addMetricData({
        name: TURTLE_BUILD_DURATION_METRIC_NAME,
        value,
        success,
        extraDimensions: dimensions_1.TYPE_DIMENSIONS(type),
    });
}
exports.addTurtleDuration = addTurtleDuration;
function addTotalDuration(type, value, success = true) {
    cloudwatch.addMetricData({
        name: TOTAL_BUILD_DURATION_METRIC_NAME,
        value,
        success,
        extraDimensions: dimensions_1.TYPE_DIMENSIONS(type),
    });
}
exports.addTotalDuration = addTotalDuration;
//# sourceMappingURL=buildDuration.js.map