import EventEmitter from 'events';

import Bunyan2Loggly from 'bunyan-loggly';

import config from 'turtle/config';
import * as constants from 'turtle/constants/logger';

export default class HackyLogglyStream extends EventEmitter {
  constructor(logglyConfig) {
    super();
    this.logglyStream = new Bunyan2Loggly(logglyConfig, config.logger.loggly.buffer);
  }
  write(rec) {
    const { msg: message, hostname: host, level, ...other } = rec;
    this.logglyStream.write({ message, level: constants.LEVELS_MAPPING[level], host, ...other });
  }
}
