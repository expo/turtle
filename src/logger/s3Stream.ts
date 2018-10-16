
import path from 'path';
import EventEmitter from 'events';

import fs from 'fs-extra';
import _ from 'lodash';

import { uploadFile } from 'turtle/aws/s3';
import config from 'turtle/config';
import * as constants from 'turtle/constants/logger';
import { IJob } from 'turtle/job';

export default class S3Stream extends EventEmitter {
  s3Url: string | null;
  lastFlush: number | null;
  filePath: string | null;
  fileHandle: number | null;
  finishedPromise: Promise<any> | null;
  finishedPromiseResolveFn: any;
  secrets: any;

  constructor() {
    super();
    this.s3Url = null;
    this.lastFlush = null;
    this.filePath = null;
    this.fileHandle = null;
    this.finishedPromise = null;
    this.finishedPromiseResolveFn = null;
  }

  async init(job: IJob) {
    this.s3Url = `logs/${job.experienceName}/${job.id}`;
    const dir = config.directories.tempS3LogsDir;
    const exists = await fs.pathExists(dir);
    if (!exists) {
      await fs.mkdir(dir);
    }
    this.filePath = path.join(dir, job.id);
    this.fileHandle = await fs.open(this.filePath, 'w+', 0o660);
    this.secrets = {};
    this.finishedPromise = new Promise(res => (this.finishedPromiseResolveFn = res));
    const res = await this.flush() as any;
    return res.Location;
  }

  async cleanup() {
    const res = this.finishedPromiseResolveFn;
    try {
      await this.flush(true);
      await fs.close(this.fileHandle as number);
      this.fileHandle = null;
      this.lastFlush = null;
      this.secrets = {};
    } finally {
      this.finishedPromise = null;
      this.finishedPromiseResolveFn = null;
      res();
    }
  }

  flush(force = false) {
    if (force || !this.lastFlush) {
      return this._flush();
    }
    const now = Date.now();
    if (now - this.lastFlush > config.logger.interval) {
      return this._flush();
    }
  }

  _flush() {
    this.lastFlush = Date.now();
    return uploadFile({
      srcPath: this.filePath as string,
      key: this.s3Url as string,
    });
  }

  write(recRaw: any) {
    if (this.fileHandle) {
      const rec = JSON.stringify({
        ...recRaw,
        level: constants.LEVELS_MAPPING[recRaw.level].toLowerCase(),
      });
      if (recRaw.lastBuildLog) {
        return this.cleanup();
      }
      const recSanitized = Object.keys(this.secrets).reduce(
        (acc, secret) => acc.replace(new RegExp(secret, 'g'), this.secrets[secret]),
        rec
      );
      fs
        .write(this.fileHandle as number, `${recSanitized}\n`)
        .then(() => {
          this.flush();
        });
    }
  }

  addSecretsToFilter(secrets: any) {
    const filteredSecrets = secrets.filter((i: any) => i !== undefined && i !== null);
    const replacements = filteredSecrets.map((i: any) => 'X'.repeat(i.length));
    const toAdd = _.zipObject(filteredSecrets, replacements);
    this.secrets = Object.assign({}, this.secrets, toAdd);
  }

  waitForLogger() {
    return this.finishedPromise;
  }
}
