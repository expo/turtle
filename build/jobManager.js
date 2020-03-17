"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const sqs = __importStar(require("./aws/sqs"));
const builders_1 = __importDefault(require("./builders"));
const BuildError_1 = __importDefault(require("./builders/BuildError"));
const common_1 = require("./builders/utils/common");
const config_1 = __importDefault(require("./config"));
const index_1 = require("./constants/index");
const logger_1 = __importDefault(require("./logger"));
const buildDurationMetric = __importStar(require("./metrics/buildDuration"));
const buildStatusMetric = __importStar(require("./metrics/buildStatus"));
const turtleContext_1 = require("./turtleContext");
const priorities_1 = require("./utils/priorities");
const redis = __importStar(require("./utils/redis"));
const validator_1 = require("./validator");
function _maybeExit() {
    if (turtleContext_1.checkShouldExit()) {
        logger_1.default.warn('Exiting due to previously received termination signal.');
        process.exit();
    }
}
async function doJob() {
    const jobData = await getJob();
    await processJob(jobData);
    _maybeExit();
}
exports.doJob = doJob;
async function getJob() {
    _maybeExit();
    logger_1.default.info('Fetching job');
    while (true) {
        try {
            let job = null;
            const priorities = await priorities_1.getPriorities();
            for (const priority of priorities) {
                job = await sqs.receiveMessage(priority);
                _maybeExit();
                if (job != null) {
                    job.priority = priority;
                    break;
                }
            }
            _maybeExit();
            if (job !== null) {
                return job;
            }
        }
        catch (err) {
            logger_1.default.error({ err }, 'Error at receiving messages');
        }
    }
}
exports.getJob = getJob;
async function processJob(jobData) {
    const receiptHandle = jobData.ReceiptHandle;
    const { priority } = jobData;
    let timeoutId;
    try {
        let rawJob;
        let job;
        try {
            rawJob = JSON.parse(jobData.Body);
            timeoutId = failAfterMaxJobTime(priority, receiptHandle, rawJob);
            logger_1.default.info({ buildJobId: rawJob.id, messageId: jobData.MessageId }, `Processing job with priority=${priority.slice(0, priority.length - 8)} timestamp=${Date.now()}`);
            job = await validator_1.sanitizeJob(rawJob);
        }
        catch (err) {
            logger_1.default.error({ err, ...rawJob && { buildJobId: rawJob.id } }, 'The build job is invalid');
            // send message only if we've managed to parse the job json
            if (rawJob) {
                await sqs.sendMessage(rawJob.id, index_1.BUILD.JOB_STATES.ERRORED, {
                    turtleVersion: turtleContext_1.turtleVersion,
                    buildDuration: 0,
                    reason: 'The build job is invalid',
                });
            }
            throw err;
        }
        turtleContext_1.setCurrentJobId(job.id);
        const pingerHandle = sqs.changeMessageVisibilityRecurring(priority, jobData.ReceiptHandle, job.id);
        const cancelled = await redis.checkIfCancelled(job.id);
        if (cancelled) {
            logger_1.default.info('The job has been cancelled');
        }
        else {
            redis.registerListener(job.id, () => deleteMessage(priority, receiptHandle));
            const startTimestamp = Date.now();
            let buildFailed = false;
            const buildType = lodash_1.default.get(job, 'config.buildType', 'default');
            try {
                const status = await build(job);
                buildStatusMetric.add(buildType, priority, status);
                buildFailed = !status;
            }
            catch (err) {
                buildStatusMetric.add(buildType, priority, false);
                buildFailed = true;
                throw err;
            }
            finally {
                const endTimestamp = Date.now();
                const turtleBuildDurationSecs = Math.ceil((endTimestamp - startTimestamp) / 1000);
                logger_1.default.info(`BuildID=${job.id} Build duration=${turtleBuildDurationSecs}`);
                buildDurationMetric.addTurtleDuration(buildType, turtleBuildDurationSecs, !buildFailed);
                if (job.messageCreatedTimestamp) {
                    const totalBuildDurationSecs = Math.ceil((endTimestamp - job.messageCreatedTimestamp) / 1000);
                    buildDurationMetric.addTotalDuration(buildType, totalBuildDurationSecs, !buildFailed);
                }
                redis.unregisterListeners();
            }
            logger_1.default.info(`Job done MessageId=${jobData.MessageId} BuildId=${job.id} ${Date.now()}`);
        }
        clearInterval(pingerHandle);
    }
    finally {
        await deleteMessage(priority, receiptHandle);
        if (timeoutId) {
            logger_1.default.info('Clearing job failer timeout...');
            clearTimeout(timeoutId);
        }
    }
}
function failAfterMaxJobTime(priority, receiptHandle, job) {
    return setTimeout(async () => {
        try {
            sqs.sendMessage(job.id, index_1.BUILD.JOB_STATES.ERRORED, { turtleVersion: turtleContext_1.turtleVersion });
            await deleteMessage(priority, receiptHandle);
        }
        finally {
            logger_1.default.error('Build timed out. Going to terminate turtle agent.');
            await logger_1.default.cleanup();
            process.exit(1);
        }
    }, config_1.default.builder.maxJobTimeMs);
}
async function build(job) {
    const startTimestamp = Date.now();
    const s3Url = await logger_1.default.initForJob(job);
    const calculateBuildDuration = () => Math.ceil((Date.now() - startTimestamp) / 1000);
    try {
        await sqs.sendMessage(job.id, index_1.BUILD.JOB_STATES.IN_PROGRESS, {
            logUrl: s3Url,
            logFormat: 'json',
        });
        const result = await builders_1.default[job.platform](job);
        const buildDuration = calculateBuildDuration();
        sqs.sendMessage(job.id, index_1.BUILD.JOB_STATES.FINISHED, {
            ...result,
            turtleVersion: turtleContext_1.turtleVersion,
            buildDuration,
        });
        return true;
    }
    catch (err) {
        common_1.logErrorOnce(err);
        const buildDuration = calculateBuildDuration();
        let reason;
        if (err instanceof BuildError_1.default) {
            reason = err.reason;
        }
        sqs.sendMessage(job.id, index_1.BUILD.JOB_STATES.ERRORED, {
            turtleVersion: turtleContext_1.turtleVersion,
            buildDuration,
            ...reason && { reason },
        });
        return false;
    }
    finally {
        await logger_1.default.cleanup();
    }
}
async function deleteMessage(priority, receiptHandle) {
    try {
        turtleContext_1.setCurrentJobId(null);
        await sqs.deleteMessage(priority, receiptHandle);
    }
    catch (err) {
        logger_1.default.error({ err }, 'Error at deleting msg');
    }
}
//# sourceMappingURL=jobManager.js.map