import EventEmitter from 'events';

import BunyanLoggly from 'bunyan-loggly';

import config from 'turtle/config';
import * as constants from 'turtle/constants/logger';
import { IJob } from 'turtle/job';

export interface ILogglyConfig {
  token: string;
  subdomain: string;
  tags: string[];
}

interface ILogglyExtraFields {
  jobID: string;
  experienceName: string;
}

export default class HackyLogglyStream extends EventEmitter {
  private logglyStream: BunyanLoggly;
  private extraFields: ILogglyExtraFields | null;

  constructor(logglyConfig: ILogglyConfig) {
    super();
    this.logglyStream = new BunyanLoggly(logglyConfig, config.logger.loggly.buffer);
    this.extraFields = null;
  }
  public init(job: IJob) {
    this.extraFields = {
      jobID: job.id,
      experienceName: job.experienceName,
    };
  }
  public cleanup() {
    this.extraFields = null;
  }
  public write(rec: any) {
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
