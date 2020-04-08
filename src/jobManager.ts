import _ from 'lodash';

import * as sqs from 'turtle/aws/sqs';
import builders from 'turtle/builders';
import BuildError from 'turtle/builders/BuildError';
import { logErrorOnce } from 'turtle/builders/utils/common';
import config from 'turtle/config';
import { BUILD } from 'turtle/constants/index';
import logger from 'turtle/logger';
import * as buildDurationMetric from 'turtle/metrics/buildDuration';
import * as buildStatusMetric from 'turtle/metrics/buildStatus';
import { checkShouldExit, setCurrentJobId, turtleVersion } from 'turtle/turtleContext';
import { getPriorities, labelConfiguration, TurtleMode } from 'turtle/utils/priorities';
import * as redis from 'turtle/utils/redis';
import { sanitizeJob } from 'turtle/validator';

function _maybeExit() {
  if (checkShouldExit()) {
    logger.warn('Exiting due to previously received termination signal.');
    process.exit();
  }
}

export async function doJob() {
  const { job, turtleMode } = await getJob();
  await processJob(job, turtleMode);
  _maybeExit();
}

export async function getJob() {
  _maybeExit();
  logger.info('Fetching job');
  while (true) {
    try {
      let job = null;
      const priorities = await getPriorities();
      const turtleMode = labelConfiguration(priorities);
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
        return { job, turtleMode };
      }
    } catch (err) {
      logger.error({ err }, 'Error at receiving messages');
    }
  }
}

async function processJob(jobData: any, turtleMode: TurtleMode) {
  const receiptHandle = jobData.ReceiptHandle;
  const { priority } = jobData;

  let timeoutId;
  try {
    let rawJob;
    let job;
    try {
      rawJob = JSON.parse(jobData.Body);
      timeoutId = failAfterMaxJobTime(priority, receiptHandle, rawJob);
      logger.info(
        { buildJobId: rawJob.id, messageId: jobData.MessageId },
        `Processing job with priority=${priority.slice(0, priority.length - 8)} timestamp=${Date.now()}`,
      );
      job = await sanitizeJob(rawJob);
    } catch (err) {
      logger.error({ err, ...rawJob && { buildJobId: rawJob.id } }, 'The build job is invalid');
      // send message only if we've managed to parse the job json
      if (rawJob) {
        await sqs.sendMessage(rawJob.id, BUILD.JOB_STATES.ERRORED, {
          turtleVersion,
          buildDuration: 0,
          reason: 'The build job is invalid',
        });
      }
      throw err;
    }
    setCurrentJobId(job.id);
    const pingerHandle = sqs.changeMessageVisibilityRecurring(priority, jobData.ReceiptHandle, job.id);

    const cancelled = await redis.checkIfCancelled(job.id);
    if (cancelled) {
      logger.info('The job has been cancelled');
    } else {
      redis.registerListener(job.id, () => deleteMessage(priority, receiptHandle));
      const startTimestamp = Date.now();
      let buildFailed = false;
      const buildType = _.get(job, 'config.buildType', 'default');
      try {
        const status = await build(job, turtleMode);
        buildStatusMetric.add(buildType, priority, status);
        buildFailed = !status;
      } catch (err) {
        buildStatusMetric.add(buildType, priority, false);
        buildFailed = true;
        throw err;
      } finally {
        const endTimestamp = Date.now();
        const turtleBuildDurationSecs = Math.ceil((endTimestamp - startTimestamp) / 1000);
        logger.info(`BuildID=${job.id} Build duration=${turtleBuildDurationSecs}`);
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
      logger.error('Build timed out. Going to terminate turtle agent.');
      await logger.cleanup();
      process.exit(1);
    }
  }, config.builder.maxJobTimeMs);
}

async function build(job: any, turtleMode: TurtleMode) {
  const startTimestamp = Date.now();
  const s3Url = await logger.initForJob(job);
  const calculateBuildDuration = () => Math.ceil((Date.now() - startTimestamp) / 1000);

  try {
    await sqs.sendMessage(job.id, BUILD.JOB_STATES.IN_PROGRESS, {
      logUrl: s3Url,
      logFormat: 'json',
      turtleMode,
    });
    const result = await (builders as any)[job.platform](job);
    const buildDuration = calculateBuildDuration();
    sqs.sendMessage(job.id, BUILD.JOB_STATES.FINISHED, {
      ...result,
      turtleVersion,
      buildDuration,
    });
    return true;
  } catch (err) {
    logErrorOnce(err);
    const buildDuration = calculateBuildDuration();
    let reason;
    if (err instanceof BuildError) {
      reason = err.reason;
    }
    sqs.sendMessage(job.id, BUILD.JOB_STATES.ERRORED, {
      turtleVersion,
      buildDuration,
      ...reason && { reason },
    });
    return false;
  } finally {
    await logger.cleanup();
  }
}

async function deleteMessage(priority: string, receiptHandle: string) {
  try {
    setCurrentJobId(null);
    await sqs.deleteMessage(priority, receiptHandle);
  } catch (err) {
    logger.error({ err }, 'Error at deleting msg');
  }
}
