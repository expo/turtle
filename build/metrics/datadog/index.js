"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dogapi_1 = __importDefault(require("dogapi"));
const util_1 = __importDefault(require("util"));
const config_1 = __importDefault(require("../../config"));
const datadogSendMetric = util_1.default.promisify(dogapi_1.default.metric.send);
if (!config_1.default.datadog.disabled) {
    dogapi_1.default.initialize({
        api_key: config_1.default.datadog.apiKey,
        app_key: config_1.default.datadog.appKey,
    });
}
const tags = [
    `env:${config_1.default.deploymentEnv}`,
    `platform:${config_1.default.platform}`,
];
function sendMetric(name, value, additionalTags) {
    if (!config_1.default.datadog.disabled) {
        return datadogSendMetric(name, value, { tags: [...tags, ...(additionalTags || [])] });
    }
}
exports.sendMetric = sendMetric;
//# sourceMappingURL=index.js.map