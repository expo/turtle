import fs from 'fs-extra';

import config from 'turtle/config';
import logger from 'turtle/logger';
import * as metrics from 'turtle/metrics';
import sendConfigToDatadog from 'turtle/metrics/buildersConfig';

export default async function commonSetup() {
  announceBuildersConfig();
  await metrics.init();
  await fs.remove(config.directories.temporaryFilesRoot);
  await fs.remove(config.directories.tempS3LogsDir);
}

async function announceBuildersConfig() {
  try {
    await sendConfigToDatadog();
  } catch (err) {
    logger.error({ err }, 'Failed to send metrics to Datadog');
  } finally {
    setTimeout(announceBuildersConfig, config.datadog.intervalMs);
  }
}
