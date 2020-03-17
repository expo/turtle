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
const util_1 = __importDefault(require("util"));
const xdl_1 = require("@expo/xdl");
const copy_1 = __importDefault(require("copy"));
const lodash_1 = __importDefault(require("lodash"));
const commonUtils = __importStar(require("../common"));
const imageHelpers = __importStar(require("../image"));
const index_1 = require("../../../constants/index");
const index_2 = __importDefault(require("../../../logger/index"));
const copyAsync = util_1.default.promisify(copy_1.default);
async function runShellAppBuilder(ctx, job) {
    const { config: jobConfig, manifest, sdkVersion: sdkVersionFromJob } = job;
    const { buildType, releaseChannel } = jobConfig;
    const sdkVersion = lodash_1.default.get(manifest, 'sdkVersion', sdkVersionFromJob);
    await copyAsync(ctx.applicationFilesSrc, ctx.baseArchiveDir);
    index_2.default.info({ buildPhase: 'icons setup' }, 'ImageUtils: setting image functions to alternative sharp implementations');
    xdl_1.ImageUtils.setResizeImageFunction(imageHelpers.resizeIconWithSharpAsync);
    xdl_1.ImageUtils.setGetImageDimensionsFunction(imageHelpers.getImageDimensionsWithSharpAsync);
    const shellAppParams = {
        action: 'configure',
        type: buildType,
        archivePath: ctx.archiveDir,
        privateConfigData: job.config,
        expoSourcePath: path_1.default.join(ctx.workingDir, 'ios'),
        manifest,
        output: ctx.outputPath,
        verbose: true,
        shellAppSdkVersion: sdkVersion,
    };
    if (buildType === index_1.IOS_BUILD_TYPES.CLIENT) {
        Object.assign(shellAppParams, {
            workspacePath: path_1.default.join(ctx.workingDir, 'ios'),
        });
    }
    else {
        Object.assign(shellAppParams, {
            url: commonUtils.getExperienceUrl(job.experienceName, job.config.publicUrl),
            releaseChannel,
            sdkVersion,
        });
    }
    index_2.default.info({ buildPhase: 'configuring NSBundle' }, 'configuring NSBundle...');
    return await xdl_1.IosShellApp.configureAndCopyArchiveAsync(shellAppParams);
}
exports.default = runShellAppBuilder;
//# sourceMappingURL=shellAppBuilder.js.map