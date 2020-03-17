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
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const xdl_1 = require("@expo/xdl");
const decompress_1 = __importDefault(require("decompress"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const utils = __importStar(require("../utils/common"));
const downloader_1 = __importDefault(require("../utils/downloader"));
const config_1 = __importDefault(require("../../../config"));
const logger_1 = __importDefault(require("../../../logger"));
const ANDROID_SDK_URL = 'https://dl.google.com/android/repository/sdk-tools-linux-4333796.zip';
const LOGGER_FIELDS = { buildPhase: 'setting up environment' };
const l = logger_1.default.child(LOGGER_FIELDS);
async function ensureAndroidSDKIsPresent() {
    const androidSdkDir = path_1.default.join(config_1.default.directories.androidDependenciesDir, 'sdk');
    await utils.removeDirectoryUnlessReady(androidSdkDir);
    if (!(await fs_extra_1.default.pathExists(androidSdkDir))) {
        await fs_extra_1.default.ensureDir(androidSdkDir);
        const androidSdkDownloadPath = utils.formatArtifactDownloadPath(ANDROID_SDK_URL);
        try {
            l.info('Downloading Android SDK');
            await fs_extra_1.default.ensureDir(config_1.default.directories.artifactsDir);
            await downloader_1.default(ANDROID_SDK_URL, androidSdkDownloadPath);
            await fs_extra_1.default.ensureDir(androidSdkDir);
            l.info('Decompressing Android SDK');
            await decompress_1.default(androidSdkDownloadPath, androidSdkDir);
            await fs_extra_1.default.remove(androidSdkDownloadPath);
            l.info('Configuring Android SDK, this may take a while');
            await _configureSdk(androidSdkDir);
            await utils.markDirectoryAsReady(androidSdkDir);
            l.info('Android SDK installed and configured successfully');
        }
        catch (err) {
            await fs_extra_1.default.remove(androidSdkDir);
            throw err;
        }
        finally {
            await fs_extra_1.default.remove(androidSdkDownloadPath);
        }
    }
    return {
        envVars: _createEnvVars(androidSdkDir),
        path: _createPaths(androidSdkDir),
    };
}
exports.default = ensureAndroidSDKIsPresent;
async function _configureSdk(androidSdkDir) {
    // prevents warnings about missing repo config
    const androidRepositoriesCfgPath = path_1.default.join(os_1.default.homedir(), '.android/repositories.cfg');
    await fs_extra_1.default.ensureFile(androidRepositoriesCfgPath);
    await xdl_1.ExponentTools.spawnAsyncThrowError('./configureAndroidSdk.sh', [], {
        pipeToLogger: true,
        loggerFields: LOGGER_FIELDS,
        cwd: path_1.default.join(config_1.default.directories.rootDir, 'scripts/android'),
        env: {
            ...process.env,
            ANDROID_HOME: androidSdkDir,
            ANDROID_SDK: androidSdkDir,
        },
    });
}
function _createEnvVars(androidSdkDir) {
    return {
        ANDROID_HOME: androidSdkDir,
        ANDROID_SDK: androidSdkDir,
    };
}
function _createPaths(androidSdkDir) {
    return [
        path_1.default.join(androidSdkDir, 'platform-tools'),
        path_1.default.join(androidSdkDir, 'tools'),
        path_1.default.join(androidSdkDir, 'tools/bin'),
        path_1.default.join(androidSdkDir, 'build-tools/28.0.3'),
    ];
}
//# sourceMappingURL=sdk.js.map