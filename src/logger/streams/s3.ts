import EventEmitter from 'events';
import path from 'path';

import fs from 'fs-extra';
import _ from 'lodash';

import { uploadFile } from 'turtle/aws/s3';
import config from 'turtle/config';
import { IJob } from 'turtle/job';

export default function create() {
  const s3 = new S3Stream();
  return {
    type: 'raw',
    stream: s3,
    reemitErrorEvents: true,
    level: config.logger.level,
  };
}

class S3Stream extends EventEmitter {
  private s3Url: string | null = null;
  private lastFlush: number | null = null;
  private filePath: string | null = null;
  private fileHandle: number | null = null;
  private uploadingPromise: Promise<void> | null = null;
  private uploadingPromiseResolveFn: any;
  private waitingOnPromise: boolean = false;

  public async init(job: IJob) {
    this.s3Url = `logs/${job.experienceName}/${job.id}`;
    const dir = config.directories.tempS3LogsDir;
    const exists = await fs.pathExists(dir);
    if (!exists) {
      await fs.mkdir(dir);
    }
    this.filePath = path.join(dir, job.id);
    this.fileHandle = await fs.open(this.filePath, 'w+', 0o660);
    this.lastFlush = null;

    const res = await this.flush() as any;
    return res.Location;
  }

  public async cleanup() {
    await this.flush(true);
    await fs.close(this.fileHandle as number);
    this.fileHandle = null;
    this.waitingOnPromise = false;
  }

  public flush(force = false) {
    if (force || !this.lastFlush) {
      return this.flushInternal();
    }
    const now = Date.now();
    if (now - this.lastFlush > config.logger.intervalMs) {
      return this.flushInternal();
    }
  }

  public write(rec: any) {
    if (!this.fileHandle) {
      return;
    }
    fs
      .write(this.fileHandle as number, `${JSON.stringify(rec)}\n`)
      .then(() => {
        this.flush();
      });
  }

  private flushInternal(): any {
    this.lastFlush = Date.now();
    if (!this.uploadingPromise) {
      this.uploadingPromise = new Promise((res) => {
        this.uploadingPromiseResolveFn = res;
      });
      return this
        .upload()
        .then((result) => {
          setTimeout(() => this.uploadingPromiseResolveFn(), 0);
          return result;
        });
    } else {
      if (this.waitingOnPromise) {
        return;
      }
      this.waitingOnPromise = true;
      return this.uploadingPromise
        .then(() => {
          this.waitingOnPromise = false;
          this.uploadingPromise = null;
          return this.flushInternal();
        });
    }
  }

  private upload() {
    return uploadFile({
      srcPath: this.filePath as string,
      key: this.s3Url as string,
    });
  }
}
