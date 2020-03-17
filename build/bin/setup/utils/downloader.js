"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const url_1 = require("url");
const progress_1 = __importDefault(require("progress"));
const request_1 = __importDefault(require("request"));
const request_progress_1 = __importDefault(require("request-progress"));
const S3_PROTOCOL = 's3:';
const PROGRESS_BAR_CONFIG = {
    TEMPLATE: 'downloading [:bar] :percent :etas',
    BAR: {
        COMPLETE_CHAR: '=',
        INCOMPLETE_CHAR: ' ',
        WIDTH: 20,
    },
};
async function download(url, destPath) {
    const httpUrl = url.startsWith(S3_PROTOCOL) ? convertS3ToHttpsUrl(url) : url;
    let bar;
    return new Promise((res, rej) => {
        request_progress_1.default(request_1.default(httpUrl))
            .on('progress', (state) => {
            if (!bar) {
                bar = new progress_1.default(PROGRESS_BAR_CONFIG.TEMPLATE, {
                    complete: PROGRESS_BAR_CONFIG.BAR.COMPLETE_CHAR,
                    incomplete: PROGRESS_BAR_CONFIG.BAR.INCOMPLETE_CHAR,
                    width: PROGRESS_BAR_CONFIG.BAR.WIDTH,
                    total: state.size.total,
                });
            }
            bar.tick(state.size.transferred - bar.curr);
        })
            .on('error', (err) => rej(err))
            .on('end', () => res())
            .pipe(fs_1.default.createWriteStream(destPath));
    });
}
exports.default = download;
function convertS3ToHttpsUrl(s3UrlRaw) {
    const { host: s3Bucket, pathname: s3Path, protocol } = new url_1.URL(s3UrlRaw);
    if (protocol !== S3_PROTOCOL) {
        throw new Error('Wrong S3 URL provided');
    }
    return `https://${s3Bucket}.s3.amazonaws.com${s3Path}`;
}
//# sourceMappingURL=downloader.js.map