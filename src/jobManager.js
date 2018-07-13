import { logErrorOnce } from 'turtle/builders/utils/common';

import * as sqs from 'turtle/aws/sqs';
import { BUILD } from 'turtle/constants/index';
import { sanitizeJob } from 'turtle/validator';
import builders from 'turtle/builders';
import config from 'turtle/config';
import logger from 'turtle/logger';
import * as redis from 'turtle/utils/redis';
import { checkShouldExit, setCurrentJobId } from 'turtle/turtleContext';

function _maybeExit() {
  if (checkShouldExit()) {
    logger.warn('Exiting due to previously received termination signal.');
    process.exit();
  }
}

export async function doJob() {
  logger.info('Fetching job');
  const jobData = await getJob();
  const receiptHandle = jobData.ReceiptHandle;

  const deleteMessage = async () => {
    try {
      setCurrentJobId(null);
      await sqs.deleteMessage(receiptHandle);
    } catch (err) {
      logger.error('Error at deleting msg', err);
    }
  };

  try {
    const rawJob = JSON.parse(jobData.Body);
    const job = await sanitizeJob(rawJob);

    setCurrentJobId(job.id);
    const pingerHandle = sqs.changeMessageVisibilityRecurring(jobData.ReceiptHandle, job.id);

    logger.info(`Doing job MessageId=${jobData.MessageId} BuildId=${job.id} ${Date.now()}`);

    const cancelled = await redis.checkIfCancelled(job.id);
    if (cancelled) {
      logger.info('The job has been cancelled');
    } else {
      redis.registerListener(job.id, deleteMessage);
      try {
        await build(job);
      } finally {
        redis.unregisterListeners();
      }
      logger.info(`Job done MessageId=${jobData.MessageId} BuildId=${job.id} ${Date.now()}`);
    }
    clearInterval(pingerHandle);
  } finally {
    await deleteMessage();
  }
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
    }
  }
}

async function build(job) {
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
