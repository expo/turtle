"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const async_retry_1 = __importDefault(require("async-retry"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const lodash_1 = __importDefault(require("lodash"));
const utils_1 = require("./utils");
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../logger"));
const turtleContext_1 = require("../turtleContext");
const sqs = new aws_sdk_1.default.SQS({
    apiVersion: '2012-11-05',
    ...lodash_1.default.pick(config_1.default.aws, ['accessKeyId', 'secretAccessKey']),
    ...lodash_1.default.pick(config_1.default.sqs, ['region']),
});
const VISIBILITY_TIMEOUT_SEC = 30;
async function receiveMessage(priority) {
    const params = {
        MaxNumberOfMessages: 1,
        QueueUrl: utils_1.QUEUE_URL(priority),
        VisibilityTimeout: VISIBILITY_TIMEOUT_SEC,
    };
    return await async_retry_1.default(() => {
        return sqs
            .receiveMessage(params)
            .promise()
            .then((data) => {
            if (data.Messages) {
                logger_1.default.info(`Received a message`);
                return data.Messages[0];
            }
            else {
                logger_1.default.debug(`No messages received [${priority}]`);
                return null;
            }
        })
            .catch((err) => {
            logger_1.default.error({ err }, 'Receive error');
            throw err;
        });
    });
}
exports.receiveMessage = receiveMessage;
async function deleteMessage(priority, receiptHandle) {
    const params = {
        QueueUrl: utils_1.QUEUE_URL(priority),
        ReceiptHandle: receiptHandle,
    };
    return await async_retry_1.default(() => {
        return sqs.deleteMessage(params).promise();
    });
}
exports.deleteMessage = deleteMessage;
async function changeMessageVisibility(priority, receiptHandle) {
    const params = {
        QueueUrl: utils_1.QUEUE_URL(priority),
        ReceiptHandle: receiptHandle,
        VisibilityTimeout: VISIBILITY_TIMEOUT_SEC,
    };
    return sqs.changeMessageVisibility(params).promise();
}
exports.changeMessageVisibility = changeMessageVisibility;
// Every VISIBILITY_TIMEOUT_SEC / 3 seconds we are telling AWS SQS
// that we're still processing the message, so it does not
// send the build job to another turtle agent
function changeMessageVisibilityRecurring(priority, receiptHandle, jobId) {
    return setInterval(() => {
        if (turtleContext_1.getCurrentJobId() === jobId) {
            changeMessageVisibility(priority, receiptHandle).catch((err) => {
                logger_1.default.warn({ err }, 'Error at change msg visibility');
            });
        }
    }, (VISIBILITY_TIMEOUT_SEC * 1000) / 3);
}
exports.changeMessageVisibilityRecurring = changeMessageVisibilityRecurring;
async function sendMessage(jobId, status, data = {}) {
    const params = {
        MessageBody: JSON.stringify({ jobId, status, ...data }),
        QueueUrl: utils_1.OUTPUT_QUEUE_URL(),
        DelaySeconds: 0,
        MessageGroupId: jobId,
    };
    try {
        return await async_retry_1.default(async () => {
            return await sqs.sendMessage(params).promise();
        });
    }
    catch (err) {
        logger_1.default.error({ err }, `Error sending SQS message: ${JSON.stringify(params)}}`);
    }
}
exports.sendMessage = sendMessage;
//# sourceMappingURL=sqs.js.map