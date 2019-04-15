import EventEmitter from 'events';

import { IJob } from 'turtle/job';

// type error when using import
// https://github.com/googleapis/nodejs-logging-bunyan/issues/241
// tslint:disable-next-line:no-var-requires
const { LoggingBunyan } = require('@google-cloud/logging-bunyan');

export interface IGCloudConfig {
  name: string;
  resource: {
    type: string;
    labels: {
      node_id: string;
      location: string;
      namespace: string;
    };
  };
}

interface IGCloudExtraFields {
  jobID: string;
  experienceName: string;
}

export default class GCloudStream extends EventEmitter {
  private logsStream: any;
  private extraFields: IGCloudExtraFields | null;

   constructor(gcloudConfig: IGCloudConfig) {
    super();

    const { name, resource } = gcloudConfig;
    this.logsStream = new LoggingBunyan({ name, resource });
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
    const { msg: message, ...other } = rec;
    this.logsStream.write({
      message,
      ...other,
      data: this.extraFields || {},
    });
  }
}
