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
const reducers = __importStar(require("../aws/cloudwatch/reducers"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../logger"));
const BUILD_METRIC_NAME = 'build';
function register() {
    logger_1.default.info(`Registered AWS Cloudwatch metric: ${BUILD_METRIC_NAME}`);
    cloudwatch.registerMetric({
        metricName: BUILD_METRIC_NAME,
        unit: 'Count',
        reducer: reducers.sum,
        dimensions: [
            [{ Name: 'env', Value: config_1.default.deploymentEnv }],
            [{ Name: 'env', Value: config_1.default.deploymentEnv }, { Name: 'platform', Value: config_1.default.platform }],
            [
                { Name: 'env', Value: config_1.default.deploymentEnv },
                { Name: 'platform', Value: config_1.default.platform },
                { Name: 'host', Value: config_1.default.hostname },
            ],
        ],
    });
}
exports.register = register;
function add(type, priority, success = true) {
    cloudwatch.addMetricData({
        name: BUILD_METRIC_NAME,
        value: 1,
        success,
        extraDimensions: dimensions_1.PRIORITY_DIMENSIONS(type, priority),
    });
}
exports.add = add;
//# sourceMappingURL=buildStatus.js.map