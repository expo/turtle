import * as url from 'url';

import config from 'turtle/config';
import { IJob } from 'turtle/job';

export function getExperienceUrl(job: IJob) {
  const { experienceName, config: jobConfig } = job;
  const { publicUrl } = jobConfig;

  // publicUrl is passed in if user wants to build an externally hosted app
  if (publicUrl) {
    return publicUrl;
  }
  const { protocol, hostname, port } = config.api;
  return url.format({ protocol, hostname, port, pathname: `/${experienceName}` });
}

const alreadyLoggedError = Symbol('alreadyLoggedError');

export function logErrorOnce(err: any, logger: any) {
  if (!err[alreadyLoggedError]) {
    logger.error(err.stack);
    err[alreadyLoggedError] = true;
  }
}
