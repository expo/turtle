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
const path_1 = __importDefault(require("path"));
const xdl_1 = require("@expo/xdl");
const fs_extra_1 = __importDefault(require("fs-extra"));
const lodash_1 = __importDefault(require("lodash"));
const semver_1 = __importDefault(require("semver"));
const constants_1 = require("../constants");
const v4_1 = __importDefault(require("uuid/v4"));
const credentials_1 = __importDefault(require("./utils/android/credentials"));
const workingdir_1 = require("./utils/android/workingdir");
const commonUtils = __importStar(require("./utils/common"));
const imageHelpers = __importStar(require("./utils/image"));
const unimodules_1 = require("./utils/unimodules");
const uploader_1 = require("./utils/uploader");
const version_1 = require("./utils/version");
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../logger"));
async function buildAndroid(jobData) {
    await version_1.ensureCanBuildSdkVersion(jobData);
    const credentials = await credentials_1.default(jobData);
    const outputFilePath = await runShellAppBuilder(jobData, credentials);
    const randomHex = v4_1.default().replace(/-/g, '');
    const s3FileExtension = jobData.config.buildType === constants_1.ANDROID_BUILD_TYPES.APP_BUNDLE ? 'aab' : 'apk';
    const s3Filename = `${jobData.experienceName}-${randomHex}-signed.${s3FileExtension}`;
    const s3FileKey = `android/${s3Filename}`;
    const fakeUploadFilename = s3Filename.replace('/', '__');
    const artifactUrl = await uploader_1.uploadBuildToS3({
        uploadPath: outputFilePath,
        s3FileKey,
        ...config_1.default.builder.fakeUpload && {
            fakeUploadBuildPath: jobData.fakeUploadBuildPath
                ? jobData.fakeUploadBuildPath
                : path_1.default.join(jobData.fakeUploadDir || config_1.default.directories.fakeUploadDir, fakeUploadFilename),
        },
    });
    return { artifactUrl };
}
exports.default = buildAndroid;
async function runShellAppBuilder(jobData, credentials) {
    const { temporaryFilesRoot } = config_1.default.directories;
    await fs_extra_1.default.ensureDir(temporaryFilesRoot);
    const tempShellAppConfigPath = path_1.default.join(temporaryFilesRoot, `app-config-${jobData.id}.json`);
    const tempKeystorePath = path_1.default.join(temporaryFilesRoot, `keystore-${jobData.id}.jks`);
    const configJSON = JSON.stringify(jobData.config);
    await fs_extra_1.default.writeFile(tempShellAppConfigPath, configJSON, { mode: 0o644 });
    await fs_extra_1.default.writeFile(tempKeystorePath, Buffer.from(credentials.keystore, 'base64'), {
        mode: 0o600,
    });
    logger_1.default.info({ buildPhase: 'starting builder' }, 'Starting build process');
    logger_1.default.info({ buildPhase: 'icons setup' }, 'ImageUtils: setting image functions to alternative sharp implementations');
    xdl_1.ImageUtils.setResizeImageFunction(imageHelpers.resizeIconWithSharpAsync);
    xdl_1.ImageUtils.setGetImageDimensionsFunction(imageHelpers.getImageDimensionsWithSharpAsync);
    const fileExtension = jobData.config.buildType === constants_1.ANDROID_BUILD_TYPES.APP_BUNDLE ? 'aab' : 'apk';
    const outputFilePath = path_1.default.join(temporaryFilesRoot, `shell-signed-${jobData.id}.${fileExtension}`);
    const { config: jobConfig, manifest, sdkVersion: sdkVersionFromJob } = jobData;
    const sdkVersion = lodash_1.default.get(manifest, 'sdkVersion', sdkVersionFromJob);
    const workingDir = workingdir_1.formatShellAppDirectory({ sdkVersion });
    // (2019-07-31) We are explicitly choosing to disable this option until we have more
    // infrastructure/tooling built around optional modules and OTA updates, as right now it's
    // very easy for developers to break apps in production with optional modules.
    //
    // to enable full resolver switch resolveExplicitOptIn to resolveNativeModules
    logger_1.default.info({ buildPhase: 'resolve native modules' }, 'Resolving universal modules dependencies');
    const enabledModules = semver_1.default.satisfies(sdkVersion, '>= 33.0.0')
        ? await unimodules_1.resolveExplicitOptIn(workingDir, lodash_1.default.get(manifest, 'dependencies'))
        : null;
    try {
        await xdl_1.AndroidShellApp.createAndroidShellAppAsync({
            url: commonUtils.getExperienceUrl(jobData.experienceName, jobData.config.publicUrl),
            sdkVersion,
            keystore: tempKeystorePath,
            manifest,
            alias: credentials.keystoreAlias,
            keystorePassword: credentials.keystorePassword,
            keyPassword: credentials.keyPassword,
            privateConfigFile: tempShellAppConfigPath,
            releaseChannel: jobConfig.releaseChannel,
            workingDir,
            outputFile: outputFilePath,
            modules: enabledModules,
            buildType: jobData.config.buildType,
            buildMode: jobData.config.buildMode,
        });
    }
    catch (err) {
        commonUtils.logErrorOnce(err);
        throw err;
    }
    finally {
        if (!config_1.default.builder.skipCleanup) {
            await fs_extra_1.default.unlink(tempShellAppConfigPath);
            await fs_extra_1.default.unlink(tempKeystorePath);
        }
    }
    return outputFilePath;
}
//# sourceMappingURL=android.js.map