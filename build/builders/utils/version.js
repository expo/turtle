"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xdl_1 = require("@expo/xdl");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../../config"));
const versions = {};
async function ensureCanBuildSdkVersion(job) {
    if (config_1.default.builder.useLocalWorkingDir) {
        return;
    }
    const platformVersions = await findSupportedSdkVersions(job.platform);
    const targetMajorSdkVersion = xdl_1.ExponentTools.parseSdkMajorVersion(job.sdkVersion || job.manifest.sdkVersion);
    if (!platformVersions.includes(targetMajorSdkVersion)) {
        throw new Error(`Unsupported SDK Version!`);
    }
}
exports.ensureCanBuildSdkVersion = ensureCanBuildSdkVersion;
async function findSupportedSdkVersions(platform) {
    if (versions[platform]) {
        return versions[platform];
    }
    else {
        const SDK_DIR_PREFIX = 'sdk';
        const files = await fs_extra_1.default.readdir(path_1.default.join(config_1.default.directories.workingDir, platform));
        const sdks = files.filter((file) => file.startsWith(SDK_DIR_PREFIX));
        versions[platform] = sdks.map((sdk) => parseInt(sdk.substr(SDK_DIR_PREFIX.length), 10));
        return versions[platform];
    }
}
exports.findSupportedSdkVersions = findSupportedSdkVersions;
//# sourceMappingURL=version.js.map