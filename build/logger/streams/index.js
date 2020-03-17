"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pickBy_1 = __importDefault(require("lodash/pickBy"));
const gcloud_1 = __importDefault(require("./gcloud"));
const offline_1 = __importDefault(require("./offline"));
const s3_1 = __importDefault(require("./s3"));
const sentry_1 = __importDefault(require("./sentry"));
const turtleContext_1 = require("../../turtleContext");
function prepareStreams() {
    if (turtleContext_1.isOffline()) {
        return {
            stdout: offline_1.default(),
        };
    }
    else {
        const allStreams = {
            stdout: { stream: process.stdout },
            gcloud: gcloud_1.default(),
            s3: s3_1.default(),
            sentry: sentry_1.default(),
        };
        return pickBy_1.default(allStreams);
    }
}
const streams = prepareStreams();
exports.default = streams;
//# sourceMappingURL=index.js.map