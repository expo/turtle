import bunyan from 'bunyan';

import config from 'turtle/config';
import { IJob } from 'turtle/job';
import streams from 'turtle/logger/streams';

interface ILoggerFields {
  [key: string]: string | number;
}

class Logger {
  private parentLogger: any;
  private currentLogger: any;

  constructor(parentLogger?: any) {
    this.parentLogger = parentLogger || bunyan.createLogger({
      name: 'turtle',
      level: config.logger.level,
      platform: config.platform,
      serializers: bunyan.stdSerializers,
      ...config.deploymentEnv && { environment: config.deploymentEnv },
      streams: Object.values(streams),
    });
    this.currentLogger = this.parentLogger;
  }

  public async initForJob(job: IJob) {
    this.currentLogger = this.parentLogger.child({
      jobID: job.id,
      experienceName: job.experienceName,
    });
    const s3Url = await streams.s3?.stream.init(job);
    return s3Url;
  }

  public async cleanup() {
    this.currentLogger = this.parentLogger;
    await streams.s3?.stream.cleanup();
  }

  public trace(...all: any[]) {
    this.currentLogger.trace(...all);
  }

  public debug(...all: any[]) {
    this.currentLogger.debug(...all);
  }

  public info(...all: any[]) {
    this.currentLogger.info(...all);
  }

  public warn(...all: any[]) {
    this.currentLogger.warn(...all);
  }

  public error(...all: any[]) {
    this.currentLogger.error(...all);
  }

  public fatal(...all: any[]) {
    this.currentLogger.fatal(...all);
  }

  public child(fields: ILoggerFields) {
    const newLogger = this.currentLogger.child(fields);
    return new Logger(newLogger);
  }

  // only for backward compatibility
  public withFields(fields: ILoggerFields) {
    return this.child(fields);
  }
}

export default new Logger();
