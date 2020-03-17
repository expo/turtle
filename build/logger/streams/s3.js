"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const s3_1 = require("../../aws/s3");
const config_1 = __importDefault(require("../../config"));
function create() {
    const s3 = new S3Stream();
    return {
        type: 'raw',
        stream: s3,
        reemitErrorEvents: true,
        level: config_1.default.logger.level,
    };
}
exports.default = create;
class S3Stream extends events_1.default {
    constructor() {
        super(...arguments);
        this.s3Url = null;
        this.lastFlush = null;
        this.filePath = null;
        this.fileHandle = null;
        this.uploadingPromise = null;
        this.waitingOnPromise = false;
    }
    async init(job) {
        this.s3Url = `logs/${job.experienceName}/${job.id}`;
        const dir = config_1.default.directories.tempS3LogsDir;
        const exists = await fs_extra_1.default.pathExists(dir);
        if (!exists) {
            await fs_extra_1.default.mkdir(dir);
        }
        this.filePath = path_1.default.join(dir, job.id);
        this.fileHandle = await fs_extra_1.default.open(this.filePath, 'w+', 0o660);
        this.lastFlush = null;
        const res = await this.flush();
        return res.Location;
    }
    async cleanup() {
        await this.flush(true);
        await fs_extra_1.default.close(this.fileHandle);
        this.fileHandle = null;
        this.waitingOnPromise = false;
    }
    flush(force = false) {
        if (force || !this.lastFlush) {
            return this.flushInternal();
        }
        const now = Date.now();
        if (now - this.lastFlush > config_1.default.logger.intervalMs) {
            return this.flushInternal();
        }
    }
    write(rec) {
        if (!this.fileHandle) {
            return;
        }
        fs_extra_1.default
            .write(this.fileHandle, `${JSON.stringify(rec)}\n`)
            .then(() => {
            this.flush();
        });
    }
    flushInternal() {
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
        }
        else {
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
    upload() {
        return s3_1.uploadFile({
            srcPath: this.filePath,
            key: this.s3Url,
        });
    }
}
//# sourceMappingURL=s3.js.map