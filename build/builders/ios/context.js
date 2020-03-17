"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const xdl_1 = require("@expo/xdl");
const uuid_1 = require("uuid");
const workingdir_1 = require("../utils/ios/workingdir");
const config_1 = __importDefault(require("../../config"));
const index_1 = require("../../constants/index");
const { EXPOKIT_APP, EXPONENT_APP } = xdl_1.IosShellApp;
function createBuilderContext(job) {
    const { join } = path;
    const appUUID = uuid_1.v4();
    const { manifest: { sdkVersion: sdkVersionFromManifest = null, } = {}, sdkVersion: sdkVersionFromJob, config: { buildType }, } = job;
    const sdkVersion = sdkVersionFromJob || sdkVersionFromManifest;
    const workingDir = workingdir_1.formatShellAppDirectory({ sdkVersion, buildType: buildType });
    const majorSdkVersion = xdl_1.ExponentTools.parseSdkMajorVersion(sdkVersion);
    const context = {
        appDir: join(config_1.default.directories.temporaryFilesRoot, appUUID),
        appUUID,
        workingDir,
    };
    context.buildDir = join(context.appDir, 'build');
    context.provisioningProfileDir = join(context.appDir, 'provisioning');
    context.provisioningProfilePath = join(context.provisioningProfileDir, `${appUUID}.mobileprovision`);
    context.tempCertPath = join(context.appDir, 'cert.p12');
    context.baseArchiveDir = join(context.appDir, 'archive');
    if (buildType === index_1.IOS_BUILD_TYPES.CLIENT) {
        context.applicationFilesSrc = join(workingDir, 'expo-client-build', '**', '*');
    }
    else {
        context.applicationFilesSrc = join(workingDir, 'shellAppBase-builds', buildType, '**', '*');
    }
    if (buildType === index_1.IOS_BUILD_TYPES.ARCHIVE) {
        context.outputPath = join(context.appDir, 'archive.xcarchive');
        context.uploadPath = join(context.buildDir, 'archive.ipa');
        context.archiveDir = join(context.baseArchiveDir, 'Release', `${EXPOKIT_APP}.xcarchive`, 'Products', 'Applications', `${EXPOKIT_APP}.app`);
        if (majorSdkVersion >= 33) {
            context.workspacePath = path.join(workingDir, 'shellAppWorkspaces', 'default', 'ios', `${EXPOKIT_APP}.xcworkspace`);
        }
        else {
            context.workspacePath = path.join(workingDir, 'shellAppWorkspaces', 'ios', 'default', `${EXPOKIT_APP}.xcworkspace`);
        }
    }
    else if (buildType === index_1.IOS_BUILD_TYPES.CLIENT) {
        context.outputPath = join(context.appDir, 'archive.xcarchive');
        context.uploadPath = join(context.buildDir, 'archive.ipa');
        context.archiveDir = join(context.baseArchiveDir, `${EXPONENT_APP}.xcarchive`, 'Products', 'Applications', `${EXPONENT_APP}.app`);
        context.workspacePath = path.join(workingDir, 'ios', `${EXPONENT_APP}.xcworkspace`);
    }
    else if (buildType === index_1.IOS_BUILD_TYPES.SIMULATOR) {
        context.outputPath = join(context.appDir, 'archive.tar.gz');
        context.uploadPath = join(context.appDir, 'archive.tar.gz');
        context.archiveDir = join(context.baseArchiveDir, 'Release', `${EXPOKIT_APP}.app`);
    }
    const s3FileExtension = buildType === index_1.IOS_BUILD_TYPES.SIMULATOR ? 'tar.gz' : 'ipa';
    const s3Filename = `${job.experienceName}-${appUUID}-${buildType}.${s3FileExtension}`;
    if (config_1.default.builder.fakeUpload) {
        const fakeUploadFilename = s3Filename.replace('/', '__');
        context.fakeUploadBuildPath = job.fakeUploadBuildPath
            ? job.fakeUploadBuildPath
            : join(job.fakeUploadDir || config_1.default.directories.fakeUploadDir, fakeUploadFilename);
    }
    else {
        context.s3FileKey = join(index_1.PLATFORMS.IOS, s3Filename);
    }
    return context;
}
exports.createBuilderContext = createBuilderContext;
//# sourceMappingURL=context.js.map