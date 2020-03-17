"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../../config"));
// type error when using import
// https://github.com/googleapis/nodejs-logging-bunyan/issues/241
// tslint:disable-next-line:no-var-requires
const { LoggingBunyan } = require('@google-cloud/logging-bunyan');
function create() {
    if (!config_1.default.google.credentials) {
        return null;
    }
    const gcloudStream = new LoggingBunyan({
        name: 'turtle',
        resource: {
            type: 'generic_node',
            labels: {
                node_id: config_1.default.hostname,
                location: '',
                namespace: '',
            },
        },
    });
    return {
        level: config_1.default.logger.level,
        type: 'raw',
        stream: gcloudStream,
    };
}
exports.default = create;
//# sourceMappingURL=gcloud.js.map