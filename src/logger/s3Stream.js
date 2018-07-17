import path from 'path';
import EventEmitter from 'events';

import fs from 'fs-extra';
import _ from 'lodash';

import { uploadFile } from 'turtle/aws/s3';
import config from 'turtle/config';
import * as constants from 'turtle/constants/logger';

export default class S3Stream extends EventEmitter {
  constructor() {
    super();
    this.s3url = null;
    this.lastFlush = null;
  }

  async init(job) {
    this.s3url = `logs/${job.experienceName}/${job.id}`;
    const dir = config.builder.tempS3LogsDir;
    const exists = await fs.exists(dir);
    if (!exists) {
      await fs.mkdir(dir);
    }
    this.filePath = path.join(dir, job.id);
    this.fileHandle = await fs.open(this.filePath, 'w+', 0o660);
    this.secrets = {};
    this.finishedPromise = new Promise(res => (this.finishedPromiseResolveFn = res));
    const res = await this.flush();
    return res.Location;
  }

  async cleanup() {
    const res = this.finishedPromiseResolveFn;
    try {
      await this.flush(true);
      await fs.close(this.fileHandle);
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
      srcPath: this.filePath,
      key: this.s3url,
    });
  }

  write(recRaw) {
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
      fs.write(this.fileHandle, `${recSanitized}\n`).then(() => this.flush());
    }
  }

  addSecretsToFilter(secrets) {
    const filteredSecrets = secrets.filter(i => i !== undefined && i !== null);
    const replacements = filteredSecrets.map(i => 'X'.repeat(i.length));
    const toAdd = _.zipObject(filteredSecrets, replacements);
    this.secrets = Object.assign({}, this.secrets, toAdd);
  }

  waitForLogger() {
    return this.finishedPromise;
  }
}
