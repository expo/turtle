"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bunyan_sentry_stream_1 = require("bunyan-sentry-stream");
const raven_1 = require("raven");
const config_1 = __importDefault(require("../../config"));
function create() {
    if (!config_1.default.sentry.dsn || config_1.default.deploymentEnv === 'development') {
        return null;
    }
    const raven = new raven_1.Client();
    raven.config(config_1.default.sentry.dsn, { environment: config_1.default.deploymentEnv });
    return {
        level: 'error',
        type: 'raw',
        stream: new bunyan_sentry_stream_1.SentryStream(raven),
    };
}
exports.default = create;
//# sourceMappingURL=sentry.js.map