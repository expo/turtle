import EventEmitter from 'events';

import BunyanLoggly from 'bunyan-loggly';

import config from 'turtle/config';
import * as constants from 'turtle/constants/logger';
import { IJob } from 'turtle/job';

export interface LogglyConfig {
  token: string;
  subdomain: string;
  tags: Array<string>;
}

interface LogglyExtraFields {
  jobID: string,
  experienceName: string;
}

export default class HackyLogglyStream extends EventEmitter {
  logglyStream: BunyanLoggly;
  extraFields: LogglyExtraFields | null;

  constructor(logglyConfig: LogglyConfig) {
    super();
    this.logglyStream = new BunyanLoggly(logglyConfig, config.logger.loggly.buffer);
    this.extraFields = null;
  }
  init(job: IJob) {
    this.extraFields = {
      jobID: job.id,
      experienceName: job.experienceName
    };
  }
  cleanup() {
    this.extraFields = null;
  }
  write(rec: any) {
    const { msg: message, hostname: host, level, ...other } = rec;
    this.logglyStream.write({
      message,
      level: constants.LEVELS_MAPPING[level],
      host,
      ...other,
      data: this.extraFields || {},
    });
  }
}
