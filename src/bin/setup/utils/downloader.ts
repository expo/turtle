import { URL } from 'url';
import fs from 'fs';

import request from 'request';
import requestProgress from 'request-progress';
import ProgressBar from 'progress';

const S3_PROTOCOL = 's3:';
const PROGRESS_BAR_CONFIG = {
  TEMPLATE: 'downloading [:bar] :percent :etas',
  BAR: {
    COMPLETE_CHAR: '=',
    INCOMPLETE_CHAR: ' ',
    WIDTH: 20,
  },
};

export default async function download(url: string, destPath: string) {
  const httpUrl = url.startsWith(S3_PROTOCOL) ? convertS3ToHttpsUrl(url) : url;
  let bar: ProgressBar;

  return new Promise((res, rej) => {
    requestProgress(request(httpUrl))
      .on('progress', (state: any) => {
          if (!bar) {
            bar = new ProgressBar(PROGRESS_BAR_CONFIG.TEMPLATE, {
              complete: PROGRESS_BAR_CONFIG.BAR.COMPLETE_CHAR,
              incomplete: PROGRESS_BAR_CONFIG.BAR.INCOMPLETE_CHAR,
              width: PROGRESS_BAR_CONFIG.BAR.WIDTH,
              total: state.size.total,
            });
          }
          bar.tick(state.size.transferred - (bar as any).curr);
      })
      .on('error', (err: Error) => rej(err))
      .on('end', () => res())
      .pipe(fs.createWriteStream(destPath));
  });
}


function convertS3ToHttpsUrl(s3UrlRaw: string) {
  const { host: s3Bucket, pathname: s3Path, protocol } = new URL(s3UrlRaw);
  if (protocol !== S3_PROTOCOL) {
    throw new Error('Wrong S3 URL provided');
  }
  return `https://${s3Bucket}.s3.amazonaws.com${s3Path}`;
}
