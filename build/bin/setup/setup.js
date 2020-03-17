"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const is_semver_1 = __importDefault(require("is-semver"));
const android_1 = __importDefault(require("./android"));
const ios_1 = __importDefault(require("./ios"));
const constants_1 = require("../../constants");
async function setup(platform, sdkVersion) {
    if (sdkVersion && !is_semver_1.default(sdkVersion)) {
        throw new Error('SDK version is not valid.');
    }
    if (platform === constants_1.PLATFORMS.IOS) {
        return await ios_1.default(sdkVersion);
    }
    else if (platform === constants_1.PLATFORMS.ANDROID) {
        return await android_1.default(sdkVersion);
    }
    else {
        throw new Error('This should never happen :(');
    }
}
exports.default = setup;
//# sourceMappingURL=setup.js.map