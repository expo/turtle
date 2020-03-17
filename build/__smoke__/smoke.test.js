"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const nock_1 = __importDefault(require("nock"));
const config_1 = __importDefault(require("../config"));
const constants_1 = require("../constants");
const jobManager = __importStar(require("../jobManager"));
const logger_1 = __importDefault(require("../logger"));
jest.mock('../builders/utils/uploader.ts', () => ({
    uploadBuildToS3: jest.fn(() => {
        logger_1.default.debug('Faking uploading build');
        return 'legit_path';
    }),
}));
async function performSmokeTest(recording) {
    jest.setTimeout(60 * 60 * 1000);
    // @ts-ignore
    const fixtureExists = await fs_extra_1.default.exists(recording);
    if (fixtureExists) {
        logger_1.default.info('Fixture exists, test will use existing one.');
        nock_1.default.load(recording);
        mockLogs();
        mockSQS();
        logger_1.default.info('Loading fixture');
    }
    else {
        nock_1.default.recorder.rec({
            dont_print: true,
            output_objects: true,
            enable_reqheaders_recording: false,
        });
    }
    await jobManager.doJob();
    if (!fixtureExists) {
        await fs_extra_1.default.writeFile(recording, JSON.stringify(nock_1.default.recorder.play()));
    }
}
function mockLogs() {
    /*
      Match log push messages. Seperate matcher, because it needs `persist` option
      due to fact that it's being called variable amount times.
    */
    return nock_1.default('https://exp-shell-app-assets.s3.us-west-1.amazonaws.com')
        .persist()
        .put((uri) => {
        return uri.indexOf('/logs') >= 0;
    })
        .reply(200);
}
function mockSQS() {
    return nock_1.default('https://sqs.us-west-2.amazonaws.com')
        .persist()
        .post(() => true)
        .reply(200);
}
function mockFinish() {
    // A separate matcher for the final request to ensure build was completed successfully
    return nock_1.default('https://sqs.us-west-2.amazonaws.com:443')
        .post('/', (body) => {
        const keys = Object.keys(body);
        if (keys.includes('MessageBody')) {
            const mb = JSON.parse(body.MessageBody);
            if (mb.status === 'finished') {
                return true;
            }
            else if (mb.status === 'errored') {
                fail('Build ended with error');
            }
        }
        return false;
    })
        .reply(200);
}
async function testPlatform(platform) {
    process.env.PLATFORM = platform;
    const utils = require('turtle/aws/utils');
    utils.QUEUE_URL = jest.fn((priority) => {
        return config_1.default.sqs.queues[priority][platform];
    });
    nock_1.default.cleanAll();
    nock_1.default.enableNetConnect();
    const finishMock = mockFinish();
    const fixtureLocation = `src/__smoke__/fixtures/${platform}/recording.json`;
    await performSmokeTest(fixtureLocation);
    expect(finishMock.isDone());
    nock_1.default.disableNetConnect();
}
test('Android builds', async () => {
    await testPlatform(constants_1.PLATFORMS.ANDROID);
});
test('iOS builds', async () => {
    await testPlatform(constants_1.PLATFORMS.IOS);
});
//# sourceMappingURL=smoke.test.js.map