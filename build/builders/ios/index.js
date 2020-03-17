"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const pick_1 = __importDefault(require("lodash/pick"));
const archive_1 = __importDefault(require("./archive"));
const context_1 = require("./context");
const simulator_1 = __importDefault(require("./simulator"));
const common_1 = require("../utils/common");
const adhocBuild_1 = __importDefault(require("../utils/ios/adhocBuild"));
const uploader_1 = require("../utils/uploader");
const version_1 = require("../utils/version");
const config_1 = __importDefault(require("../../config"));
const constants_1 = require("../../constants");
async function iosBuilder(job) {
    if (job.config.buildType !== constants_1.IOS_BUILD_TYPES.CLIENT) {
        await version_1.ensureCanBuildSdkVersion(job);
    }
    const ctx = context_1.createBuilderContext(job);
    try {
        await initBuilder(ctx);
        const { buildType } = job.config;
        if (buildType === constants_1.IOS_BUILD_TYPES.CLIENT) {
            await adhocBuild_1.default(job);
        }
        if ([constants_1.IOS_BUILD_TYPES.ARCHIVE, constants_1.IOS_BUILD_TYPES.CLIENT].includes(buildType)) {
            await archive_1.default(ctx, job);
        }
        else if (buildType === constants_1.IOS_BUILD_TYPES.SIMULATOR) {
            await simulator_1.default(ctx, job);
        }
        else {
            throw new Error(`Unsupported iOS build type: ${buildType}`);
        }
        const artifactUrl = await uploader_1.uploadBuildToS3(ctx);
        return { artifactUrl };
    }
    catch (err) {
        common_1.logErrorOnce(err);
        throw err;
    }
    finally {
        await cleanup(ctx);
    }
}
exports.default = iosBuilder;
async function initBuilder(ctx) {
    for (const dir of getTemporaryDirs(ctx)) {
        await fs_extra_1.default.ensureDir(dir);
        await fs_extra_1.default.chmod(dir, 0o755);
    }
}
async function cleanup(ctx) {
    if (config_1.default.builder.skipCleanup) {
        return;
    }
    await Promise.all(getTemporaryDirs(ctx).map((dir) => fs_extra_1.default.remove(dir)));
}
const getTemporaryDirs = (ctx) => Object.values(pick_1.default(ctx, ['appDir', 'provisioningProfileDir']));
//# sourceMappingURL=index.js.map