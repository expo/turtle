"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const last_1 = __importDefault(require("lodash/last"));
const trim_1 = __importDefault(require("lodash/trim"));
const path_1 = __importDefault(require("path"));
const semver_1 = __importDefault(require("semver"));
const xdl_1 = require("@expo/xdl");
const common_1 = require("./utils/common");
const workingdir_1 = require("../../builders/utils/ios/workingdir");
const config_1 = __importDefault(require("../../config"));
const constants_1 = require("../../constants");
const logger_1 = __importDefault(require("../../logger"));
const REQUIRED_TOOLS = [
    {
        command: 'bash',
        missingDescription: 'Please install bash',
    },
    {
        command: 'fastlane',
        missingDescription: 'Please check https://docs.fastlane.tools/getting-started/ios/setup/',
        versionCheckFn: async () => {
            const MINIMAL_VERSION = '2.99.0';
            const { stdout } = await xdl_1.ExponentTools.spawnAsyncThrowError('fastlane', ['--version'], { stdio: 'pipe', env: { ...process.env, FASTLANE_SKIP_UPDATE_CHECK: '1', LC_ALL: 'en_US.UTF-8' } });
            const fastlaneVersion = parseFastlaneVersion(stdout);
            if (fastlaneVersion && !semver_1.default.satisfies(fastlaneVersion, `>= ${MINIMAL_VERSION}`)) {
                throw new Error(`Your fastlane is on version ${fastlaneVersion}. Please upgrade it to at least ${MINIMAL_VERSION}.`);
            }
        },
    },
    {
        command: 'xcode',
        missingDescription: 'Please ensure xcode is properly installed',
        testFn: async () => {
            const { status, stdout } = await xdl_1.ExponentTools.spawnAsyncThrowError('xcodebuild', ['-version'], { stdio: 'pipe' });
            if (stdout.match(/requires xcode/i)) {
                return false;
            }
            if (status !== 0) {
                return false;
            }
            try {
                await xdl_1.ExponentTools.spawnAsyncThrowError('ibtool', ['--version'], { stdio: 'pipe' });
            }
            catch (err) {
                if (err.stderr) {
                    const stderr = err.stderr.trim();
                    if (stderr.match(/Agreeing to the Xcode\/iOS license/)) {
                        logger_1.default.error('You have not accepted the Xcode license. Run \'sudo xcodebuild -runFirstLaunch\' to do so.');
                        return false;
                    }
                    if (stderr.match(/The bundle is damaged or missing necessary resources/)) {
                        logger_1.default.error('Make sure to install additional required components. Run \'sudo xcodebuild -runFirstLaunch\' to do so.');
                        return false;
                    }
                }
            }
            return true;
        },
    },
];
async function setup(sdkVersion) {
    await common_1.checkSystem(REQUIRED_TOOLS);
    if (sdkVersion) {
        await common_1.ensureShellAppIsPresent(sdkVersion, {
            formatShellAppDirectory: workingdir_1.formatShellAppDirectory,
            formatShellAppTarballUriPath,
        });
    }
}
exports.default = setup;
function formatShellAppTarballUriPath(sdkMajorVersion) {
    return path_1.default.join(config_1.default.directories.shellTarballsDir, constants_1.PLATFORMS.IOS, `sdk${sdkMajorVersion}`);
}
function parseFastlaneVersion(stdout) {
    const lastLine = last_1.default(trim_1.default(stdout).split('\n'));
    if (!lastLine) {
        return null;
    }
    return last_1.default(lastLine.split(' ')) || null;
}
//# sourceMappingURL=ios.js.map