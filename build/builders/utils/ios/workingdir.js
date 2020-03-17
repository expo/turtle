"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const xdl_1 = require("@expo/xdl");
const config_1 = __importDefault(require("../../../config"));
const constants_1 = require("../../../constants");
function formatShellAppDirectory({ sdkVersion, buildType }) {
    const { workingDir } = config_1.default.directories;
    if (buildType === constants_1.IOS_BUILD_TYPES.CLIENT) {
        return path_1.default.join(workingDir, constants_1.PLATFORMS.IOS, 'client');
    }
    else if (config_1.default.builder.useLocalWorkingDir) {
        return path_1.default.join(workingDir, 'local');
    }
    else {
        const majorVersion = xdl_1.ExponentTools.parseSdkMajorVersion(sdkVersion);
        return path_1.default.join(workingDir, constants_1.PLATFORMS.IOS, `sdk${majorVersion}`);
    }
}
exports.formatShellAppDirectory = formatShellAppDirectory;
//# sourceMappingURL=workingdir.js.map