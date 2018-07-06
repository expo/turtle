import AWS from 'aws-sdk';
import _ from 'lodash';
import retry from 'async-retry';

import logger from 'turtle/logger';
import config from 'turtle/config';

const sqs = new AWS.SQS({
  apiVersion: '2012-11-05',
  ..._.pick(config.aws, ['accessKeyId', 'secretAccessKey']),
  ..._.pick(config.sqs, ['region']),
});

const VISIBILITY_TIMEOUT_SEC = 30;
const QUEUE_URL = config.sqs.queues[config.platform];
const OUTPUT_QUEUE_URL = config.sqs.queues.out;

export async function receiveMessage() {
  const params = {
    MaxNumberOfMessages: 1,
    QueueUrl: QUEUE_URL,
    VisibilityTimeout: VISIBILITY_TIMEOUT_SEC,
  };
  return await retry(bail => {
    return sqs
      .receiveMessage(params)
      .promise()
      .then(data => {
        if (data.Messages) {
          logger.info(`Received a message`);
          return data.Messages[0];
        } else {
          logger.debug('No messages received');
          return null;
        }
      })
      .catch(err => {
        logger.error('Receive error', err);
        throw err;
      });
  });
}

export async function deleteMessage(receiptHandle) {
  const params = {
    QueueUrl: QUEUE_URL,
    ReceiptHandle: receiptHandle,
  };
  return await retry(bail => {
    return sqs.deleteMessage(params).promise();
  });
}

export async function changeMessageVisibility(receiptHandle) {
  const params = {
    QueueUrl: QUEUE_URL,
    ReceiptHandle: receiptHandle,
    VisibilityTimeout: VISIBILITY_TIMEOUT_SEC,
  };
  return sqs.changeMessageVisibility(params).promise();
}

// Every VISIBILITY_TIMEOUT_SEC / 3 seconds we are telling AWS SQS
// that we're still proccessing the message, so it does not
// send the build job to another turtle agent
export function changeMessageVisibilityRecurring(receiptHandle) {
  return setInterval(() => {
    changeMessageVisibility(receiptHandle).catch(err =>
      logger.error('Error at change msg visibility', err)
    );
  }, VISIBILITY_TIMEOUT_SEC * 1000 / 3);
}

export async function sendMessage(jobId, status, data = {}) {
  var params = {
    MessageBody: JSON.stringify({ jobId, status, ...data }),
    QueueUrl: OUTPUT_QUEUE_URL,
    DelaySeconds: 0,
    MessageGroupId: jobId,
  };
  try {
    return await retry(async bail => {
      return await sqs.sendMessage(params).promise();
    });
  } catch (err) {
    logger.error(`Error sending SQS message: ${JSON.stringify(params)}}`, err);
  }
}
