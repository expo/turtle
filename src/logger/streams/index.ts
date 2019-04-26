import pickBy from 'lodash/pickBy';

import createGCloudStream from 'turtle/logger/streams/gcloud';
import createOfflineStream from 'turtle/logger/streams/offline';
import createS3Stream from 'turtle/logger/streams/s3';
import createSentryStream from 'turtle/logger/streams/sentry';
import { isOffline } from 'turtle/turtleContext';

interface IStream {
  stream: any;
  type?: string;
  level?: string;
  reemitErrorEvents?: boolean;
}

interface IStreamMap {
  [key: string]: IStream;
}

function prepareStreams(): IStreamMap {
  if (isOffline()) {
    return {
      stdout: createOfflineStream(),
    };
  } else {
    const allStreams = {
      stdout: { stream: process.stdout },
      gcloud: createGCloudStream(),
      s3: createS3Stream(),
      sentry: createSentryStream(),
    };
    return pickBy(allStreams) as IStreamMap;
  }
}

const streams = prepareStreams();

export default streams;
