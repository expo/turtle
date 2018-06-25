import { logErrorOnce } from 'turtle/builders/utils/common';

import * as sqs from 'turtle/aws/sqs';
import { BUILD } from 'turtle/constants/index';
import { sanitizeJob } from 'turtle/validator';
import builders from 'turtle/builders';
import config, { checkShouldExit } from 'turtle/config';
import logger from 'turtle/logger';

function _maybeExit() {
  if (checkShouldExit()) {
    logger.warn('Exiting due to previously received termination signal.');
    process.exit();
  }
}

export async function doJob() {
  logger.info('Fetching job');
  const jobData = await getJob();
  const pingerHandle = sqs.changeMessageVisibilityRecurring(jobData.ReceiptHandle);
  const receiptHandle = jobData.ReceiptHandle;

  logger.info(`Doing job ${jobData.MessageId} ${Date.now()}`);
  const job = JSON.parse(jobData.Body);

  await build(job);
  logger.info(`Job done ${jobData.MessageId} ${Date.now()}`);

  try {
    await sqs.deleteMessage(receiptHandle);
  } catch (err) {
    logger.error('Error at deleting msg', err);
  }

  clearInterval(pingerHandle);
  _maybeExit();
}

export async function getJob() {
  _maybeExit();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const job = await sqs.receiveMessage();
      _maybeExit();
      if (job !== null) {
        return job;
      }
    } catch (err) {
      logger.error('Error at receiving messages', err);
      if (config.builder.exitOnReceiveError) {
        logger.warn('Shuting down due to receive from SQS error');
        process.exit(1);
      }
    }
  }
}

async function build(rawJob) {
  const job = await sanitizeJob(rawJob);
  const s3Url = await logger.init(job);
  const { turtleVersion } = job.config;

  try {
    await sqs.sendMessage(job.id, BUILD.JOB_STATES.IN_PROGRESS, {
      logUrl: s3Url,
      logFormat: 'json',
      turtleVersion,
    });
    const result = await builders[job.platform](job);
    sqs.sendMessage(job.id, BUILD.JOB_STATES.FINISHED, { ...result, turtleVersion });
  } catch (err) {
    logErrorOnce(err);
    sqs.sendMessage(job.id, BUILD.JOB_STATES.ERRORED, { turtleVersion });
  }

  await logger.cleanup(job);
}
