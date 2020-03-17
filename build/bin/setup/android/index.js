"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const util_1 = __importDefault(require("util"));
const xdl_1 = require("@expo/xdl");
const fs_extra_1 = __importDefault(require("fs-extra"));
const which_1 = __importDefault(require("which"));
const sdk_1 = __importDefault(require("./sdk"));
const common_1 = require("../utils/common");
const workingdir_1 = require("../../../builders/utils/android/workingdir");
const config_1 = __importDefault(require("../../../config"));
const constants_1 = require("../../../constants");
const logger_1 = __importDefault(require("../../../logger"));
const which = util_1.default.promisify(which_1.default);
const JAVA_REQUIRED_VERSION = 8;
const REQUIRED_TOOLS = [
    {
        command: 'bash',
        missingDescription: 'Please install bash',
    },
    {
        command: 'javac',
        missingDescription: `Please install JDK 8 - keep in mind that other versions are not supported by Android`,
        testFn: async () => {
            const { status, stdout, stderr } = await xdl_1.ExponentTools.spawnAsyncThrowError('java', ['-version'], { stdio: 'pipe' });
            if (stdout.match(/no java runtime present/i)) {
                return false;
            }
            const matchResult = stderr.match(/.*version "(.*)"/);
            if (matchResult) {
                const [, currentFullJavaVersion] = matchResult;
                const javaMajorVersionPosition = currentFullJavaVersion.startsWith('1.') ? 1 : 0;
                const javaMajorVersion = Number(currentFullJavaVersion.split('.')[javaMajorVersionPosition]);
                if (javaMajorVersion !== JAVA_REQUIRED_VERSION) {
                    throw new Error(`You're on Java ${currentFullJavaVersion}, please install version ${JAVA_REQUIRED_VERSION}`);
                }
            }
            else {
                logger_1.default.warn(`Couldn't find Java version number, assuming you're on Java ${JAVA_REQUIRED_VERSION}...`);
            }
            return status === 0;
        },
    },
];
const LOGGER_FIELDS = { buildPhase: 'setting up environment' };
const l = logger_1.default.child(LOGGER_FIELDS);
async function setup(sdkVersion) {
    await common_1.checkSystem(REQUIRED_TOOLS);
    await prepareAndroidEnv();
    if (sdkVersion) {
        await common_1.ensureShellAppIsPresent(sdkVersion, { formatShellAppDirectory: workingdir_1.formatShellAppDirectory, formatShellAppTarballUriPath }, _shellAppPostDownloadAction);
    }
}
exports.default = setup;
async function prepareAndroidEnv() {
    await fs_extra_1.default.ensureDir(config_1.default.directories.androidDependenciesDir);
    const sdkConfig = await sdk_1.default();
    _setEnvVars(sdkConfig.envVars);
    _alterPath(sdkConfig.path);
}
function formatShellAppTarballUriPath(sdkMajorVersion) {
    return path_1.default.join(config_1.default.directories.shellTarballsDir, constants_1.PLATFORMS.ANDROID, `sdk${sdkMajorVersion}`);
}
async function _shellAppPostDownloadAction(sdkVersion, workingdir) {
    const inWorkingdir = (filename) => path_1.default.join(workingdir, filename);
    if (await fs_extra_1.default.pathExists(inWorkingdir('universe-package.json'))) {
        // legacy shell app built from universe
        await fs_extra_1.default.move(inWorkingdir('package.json'), inWorkingdir('exponent-package.json'));
        await fs_extra_1.default.move(inWorkingdir('universe-package.json'), inWorkingdir('package.json'));
        await _installNodeModules(workingdir);
        await fs_extra_1.default.move(inWorkingdir('package.json'), inWorkingdir('universe-package.json'));
        await fs_extra_1.default.move(inWorkingdir('exponent-package.json'), inWorkingdir('package.json'));
    }
    else {
        // new shell app built from expo or not
        await _installNodeModules(workingdir);
    }
    // TODO: remove this after making sure that we don't need node_modules in tools-public for older sdks
    if (xdl_1.ExponentTools.parseSdkMajorVersion(sdkVersion) < 33) {
        const toolsPublicDir = path_1.default.join(workingdir, 'tools-public');
        await _installNodeModules(toolsPublicDir);
    }
}
async function _installNodeModules(cwd) {
    l.info(`installing dependencies in ${cwd} directory...`);
    const command = await _shouldUseYarnOrNpm();
    await xdl_1.ExponentTools.spawnAsyncThrowError(command, ['install'], {
        pipeToLogger: true,
        loggerFields: LOGGER_FIELDS,
        cwd,
    });
    l.info('dependencies installed!');
}
async function _shouldUseYarnOrNpm() {
    try {
        await which('yarn');
        return 'yarn';
    }
    catch (err) {
        return 'npm';
    }
}
function _setEnvVars(envVars) {
    Object
        .entries(envVars)
        .forEach(([key, value]) => process.env[key] = value);
}
function _alterPath(newPaths) {
    const currentPaths = process.env.PATH ? process.env.PATH.split(':') : [];
    const paths = [...newPaths, ...currentPaths];
    process.env.PATH = paths.join(':');
}
//# sourceMappingURL=index.js.map