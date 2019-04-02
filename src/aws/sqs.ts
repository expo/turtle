import retry from 'async-retry';
import AWS from 'aws-sdk';
import _ from 'lodash';

import { OUTPUT_QUEUE_URL, QUEUE_URL } from 'turtle/aws/utils';
import config from 'turtle/config';
import { JOB_UPDATE_TYPE } from 'turtle/constants/build';
import logger from 'turtle/logger';
import { getCurrentJobId } from 'turtle/turtleContext';

const sqs = new AWS.SQS({
  apiVersion: '2012-11-05',
  ..._.pick(config.aws, ['accessKeyId', 'secretAccessKey']),
  ..._.pick(config.sqs, ['region']),
});

const VISIBILITY_TIMEOUT_SEC = 30;

export async function receiveMessage(priority: string) {
  const params = {
    MaxNumberOfMessages: 1,
    QueueUrl: QUEUE_URL(priority),
    VisibilityTimeout: VISIBILITY_TIMEOUT_SEC,
  };
  return await retry(() => {
    return sqs
      .receiveMessage(params)
      .promise()
      .then((data) => {
        if (data.Messages) {
          logger.info(`Received a message`);
          return data.Messages[0];
        } else {
          logger.debug(`No messages received [${priority}]`);
          return null;
        }
      })
      .catch((err) => {
        logger.error({err}, 'Receive error');
        throw err;
      });
  });
}

export async function deleteMessage(priority: string, receiptHandle: string) {
  const params = {
    QueueUrl: QUEUE_URL(priority),
    ReceiptHandle: receiptHandle,
  };
  return await retry(() => {
    return sqs.deleteMessage(params).promise();
  });
}

export async function changeMessageVisibility(priority: string, receiptHandle: string) {
  const params = {
    QueueUrl: QUEUE_URL(priority),
    ReceiptHandle: receiptHandle,
    VisibilityTimeout: VISIBILITY_TIMEOUT_SEC,
  };
  return sqs.changeMessageVisibility(params).promise();
}

// Every VISIBILITY_TIMEOUT_SEC / 3 seconds we are telling AWS SQS
// that we're still processing the message, so it does not
// send the build job to another turtle agent
export function changeMessageVisibilityRecurring(priority: string, receiptHandle: string, jobId: string) {
  return setInterval(() => {
    if (getCurrentJobId() === jobId) {
      changeMessageVisibility(priority, receiptHandle).catch((err) => {
        logger.warn({err}, 'Error at change msg visibility');
      });
    }
  }, (VISIBILITY_TIMEOUT_SEC * 1000) / 3);
}

export async function sendMessage(jobId: string, status: JOB_UPDATE_TYPE, data = {}) {
  const params = {
    MessageBody: JSON.stringify({ jobId, status, ...data }),
    QueueUrl: OUTPUT_QUEUE_URL(),
    DelaySeconds: 0,
    MessageGroupId: jobId,
  };
  try {
    return await retry(async () => {
      return await sqs.sendMessage(params).promise();
    });
  } catch (err) {
    logger.error({err}, `Error sending SQS message: ${JSON.stringify(params)}}`);
  }
}
