"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const xdl_1 = require("@expo/xdl");
const config_1 = __importDefault(require("../../../config"));
const constants_1 = require("../../../constants");
function formatShellAppDirectory({ sdkVersion }) {
    const majorSdkVersion = xdl_1.ExponentTools.parseSdkMajorVersion(sdkVersion);
    return config_1.default.builder.useLocalWorkingDir
        ? path_1.default.join(config_1.default.directories.workingDir, 'local')
        : path_1.default.join(config_1.default.directories.workingDir, constants_1.PLATFORMS.ANDROID, `sdk${majorSdkVersion}`);
}
exports.formatShellAppDirectory = formatShellAppDirectory;
//# sourceMappingURL=workingdir.js.map