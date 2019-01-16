import _ from 'lodash';
import { logErrorOnce } from 'turtle/builders/utils/common';
import logger from 'turtle/logger';

import * as sqs from 'turtle/aws/sqs';
import { BUILD } from 'turtle/constants/index';
import { sanitizeJob } from 'turtle/validator';
import builders from 'turtle/builders';
import config from 'turtle/config';
import * as redis from 'turtle/utils/redis';
import { checkShouldExit, setCurrentJobId } from 'turtle/turtleContext';
import * as buildStatusMetric from 'turtle/metrics/buildStatus';
import * as buildDurationMetric from 'turtle/metrics/buildDuration';
import { getPriorities } from 'turtle/utils/priorities';

const { version: turtleVersion } = require('../package.json');

function _maybeExit() {
  if (checkShouldExit()) {
    logger.warn('Exiting due to previously received termination signal.');
    process.exit();
  }
}

export async function doJob() {
  const jobData = await getJob();
  await processJob(jobData);
  _maybeExit();
}

export async function getJob() {
  _maybeExit();
  logger.info('Fetching job');
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      let job = null;
      const priorities = await getPriorities();
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
    } catch (err) {
      logger.error('Error at receiving messages', err);
    }
  }
}

async function processJob(jobData: any) {
  const receiptHandle = jobData.ReceiptHandle;
  const { priority } = jobData;
  let timeoutId;
  try {
    const rawJob = JSON.parse(jobData.Body);
    timeoutId = failAfterMaxJobTime(priority, receiptHandle, rawJob);
    const job = await sanitizeJob(rawJob);

    setCurrentJobId(job.id);
    const pingerHandle = sqs.changeMessageVisibilityRecurring(priority, jobData.ReceiptHandle, job.id);

    logger.info(`Doing job MessageId=${jobData.MessageId} BuildId=${job.id} ${Date.now()}`);

    const cancelled = await redis.checkIfCancelled(job.id);
    if (cancelled) {
      logger.info('The job has been cancelled');
    } else {
      redis.registerListener(job.id, () => deleteMessage(priority, receiptHandle));
      const startTimestamp = +new Date();
      let buildFailed = false;
      const buildType = _.get(job, 'config.buildType', 'default');
      try {
        const success = await build(job);
        buildStatusMetric.add(buildType, success);
        buildFailed = !success;
      } catch (err) {
        buildStatusMetric.add(buildType, false);
        buildFailed = true;
        throw err;
      } finally {
        const endTimestamp = +new Date();
        const turtleBuildDurationSecs = Math.ceil((endTimestamp - startTimestamp) / 1000);
        buildDurationMetric.addTurtleDuration(buildType, turtleBuildDurationSecs, !buildFailed);
        if (job.messageCreatedTimestamp) {
          const totalBuildDurationSecs = Math.ceil(
            (endTimestamp - job.messageCreatedTimestamp) / 1000,
          );
          buildDurationMetric.addTotalDuration(buildType, totalBuildDurationSecs, !buildFailed);
        }
        redis.unregisterListeners();
      }
      logger.info(`Job done MessageId=${jobData.MessageId} BuildId=${job.id} ${Date.now()}`);
    }
    clearInterval(pingerHandle);
  } finally {
    await deleteMessage(priority, receiptHandle);
    if (timeoutId) {
      logger.info('Clearing job failer timeout...');
      clearTimeout(timeoutId);
    }
  }
}

function failAfterMaxJobTime(priority: string, receiptHandle: string, job: any) {
  return setTimeout(async () => {
    try {
      sqs.sendMessage(job.id, BUILD.JOB_STATES.ERRORED, { turtleVersion });
      await deleteMessage(priority, receiptHandle);
    } finally {
      logger.error('Going to terminate turtle agent, just in case...');
      process.exit(1);
    }
  }, config.builder.maxJobTimeMs);
}

async function build(job: any) {
  const s3Url = await logger.init(job);

  try {
    await sqs.sendMessage(job.id, BUILD.JOB_STATES.IN_PROGRESS, {
      logUrl: s3Url,
      logFormat: 'json',
    });
    const result = await (builders as any)[job.platform](job);
    sqs.sendMessage(job.id, BUILD.JOB_STATES.FINISHED, { ...result, turtleVersion });
    return true;
  } catch (err) {
    logErrorOnce(err);
    sqs.sendMessage(job.id, BUILD.JOB_STATES.ERRORED, { turtleVersion });
    return false;
  } finally {
    await logger.cleanup(job);
  }
}

async function deleteMessage(priority: string, receiptHandle: string) {
  try {
    setCurrentJobId(null);
    await sqs.deleteMessage(priority, receiptHandle);
  } catch (err) {
    logger.error('Error at deleting msg', err);
  }
}
