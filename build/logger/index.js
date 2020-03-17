"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bunyan_1 = __importDefault(require("bunyan"));
const config_1 = __importDefault(require("../config"));
const streams_1 = __importDefault(require("./streams"));
class Logger {
    constructor(parentLogger) {
        this.parentLogger = parentLogger || bunyan_1.default.createLogger({
            name: 'turtle',
            level: config_1.default.logger.level,
            platform: config_1.default.platform,
            serializers: bunyan_1.default.stdSerializers,
            ...config_1.default.deploymentEnv && { environment: config_1.default.deploymentEnv },
            streams: Object.values(streams_1.default),
        });
        this.currentLogger = this.parentLogger;
    }
    async initForJob(job) {
        this.currentLogger = this.parentLogger.child({
            jobID: job.id,
            experienceName: job.experienceName,
        });
        const s3Url = await streams_1.default.s3.stream.init(job);
        return s3Url;
    }
    async cleanup() {
        this.currentLogger = this.parentLogger;
        await streams_1.default.s3.stream.cleanup();
    }
    trace(...all) {
        this.currentLogger.trace(...all);
    }
    debug(...all) {
        this.currentLogger.debug(...all);
    }
    info(...all) {
        this.currentLogger.info(...all);
    }
    warn(...all) {
        this.currentLogger.warn(...all);
    }
    error(...all) {
        this.currentLogger.error(...all);
    }
    fatal(...all) {
        this.currentLogger.fatal(...all);
    }
    child(fields) {
        const newLogger = this.currentLogger.child(fields);
        return new Logger(newLogger);
    }
    // only for backward compatibility
    withFields(fields) {
        return this.child(fields);
    }
}
exports.default = new Logger();
//# sourceMappingURL=index.js.map