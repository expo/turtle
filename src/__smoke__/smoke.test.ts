import fs from 'fs-extra';

import nock from 'nock';

import config from 'turtle/config';
import { PLATFORMS } from 'turtle/constants';
import * as jobManager from 'turtle/jobManager';
import logger from 'turtle/logger';

jest.mock('../builders/utils/uploader.ts', () => ({
  uploadBuildToS3: jest.fn(() => {
    logger.debug('Faking uploading build');
    return 'legit_path';
  }),
}));

async function performSmokeTest(recording: string) {
  jest.setTimeout(60 * 60 * 1000);

  // @ts-ignore
  const fixtureExists = await fs.exists(recording);
  if (fixtureExists) {
    logger.info('Fixture exists, test will use existing one.');

    nock.load(recording);
    mockLogs();
    mockSQS();
    logger.info('Loading fixture');
  } else {
    nock.recorder.rec({
      dont_print: true,
      output_objects: true,
      enable_reqheaders_recording: false,
    });
  }

  await jobManager.doJob();
  if (!fixtureExists) {
    await fs.writeFile(recording, JSON.stringify(nock.recorder.play()));
  }
}

function mockLogs() {
  /*
    Match log push messages. Seperate matcher, because it needs `persist` option
    due to fact that it's being called variable amount times.
  */
  return nock('https://exp-shell-app-assets.s3.us-west-1.amazonaws.com')
    .persist()
    .put((uri: string) => {
      return uri.indexOf('/logs') >= 0;
    })
    .reply(200);
}

function mockSQS() {
  return nock('https://sqs.us-west-2.amazonaws.com')
    .persist()
    .post(() => true)
    .reply(200);
}

function mockFinish() {
  // A separate matcher for the final request to ensure build was completed successfully

  return nock('https://sqs.us-west-2.amazonaws.com:443')
    .post('/', (body: any) => {
      const keys = Object.keys(body);
      if (keys.includes('MessageBody')) {
        const mb = JSON.parse(body.MessageBody);
        if (mb.status === 'finished') {
          return true;
        } else if (mb.status === 'errored') {
          fail('Build ended with error');
        }
      }
      return false;
    })
    .reply(200);
}

async function testPlatform(platform: string) {
  process.env.PLATFORM = platform;

  const utils = require('turtle/aws/utils');
  utils.QUEUE_URL = jest.fn((priority) => {
    return (config.sqs.queues as any)[priority][platform];
  });

  nock.cleanAll();
  nock.enableNetConnect();

  const finishMock = mockFinish();
  const fixtureLocation = `src/__smoke__/fixtures/${platform}/recording.json`;
  await performSmokeTest(fixtureLocation);
  expect(finishMock.isDone());
  nock.disableNetConnect();
}

test('Android builds', async () => {
  await testPlatform(PLATFORMS.ANDROID);
});

test('iOS builds', async () => {
  await testPlatform(PLATFORMS.IOS);
});
