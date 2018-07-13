import * as url from 'url';

import config from 'turtle/config';
import logger from 'turtle/logger';

export function getExperienceUrl(experienceName: string) {
  const { protocol, hostname, port } = config.api;
  return url.format({ protocol, hostname, port, pathname: `/${experienceName}` });
}

const alreadyLoggedError = Symbol('alreadyLoggedError');

export function logErrorOnce(err: any) {
  if (!err[alreadyLoggedError]) {
    logger.error(err.stack);
    err[alreadyLoggedError] = true;
  }
}
