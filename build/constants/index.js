"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const BUILD = __importStar(require("./build"));
exports.BUILD = BUILD;
var PLATFORMS;
(function (PLATFORMS) {
    PLATFORMS["IOS"] = "ios";
    PLATFORMS["ANDROID"] = "android";
})(PLATFORMS = exports.PLATFORMS || (exports.PLATFORMS = {}));
var IOS_BUILD_TYPES;
(function (IOS_BUILD_TYPES) {
    IOS_BUILD_TYPES["ARCHIVE"] = "archive";
    IOS_BUILD_TYPES["CLIENT"] = "client";
    IOS_BUILD_TYPES["SIMULATOR"] = "simulator";
})(IOS_BUILD_TYPES = exports.IOS_BUILD_TYPES || (exports.IOS_BUILD_TYPES = {}));
var ANDROID_BUILD_TYPES;
(function (ANDROID_BUILD_TYPES) {
    ANDROID_BUILD_TYPES["APK"] = "apk";
    ANDROID_BUILD_TYPES["APP_BUNDLE"] = "app-bundle";
})(ANDROID_BUILD_TYPES = exports.ANDROID_BUILD_TYPES || (exports.ANDROID_BUILD_TYPES = {}));
var ANDROID_BUILD_MODES;
(function (ANDROID_BUILD_MODES) {
    ANDROID_BUILD_MODES["DEBUG"] = "debug";
    ANDROID_BUILD_MODES["RELEASE"] = "release";
})(ANDROID_BUILD_MODES = exports.ANDROID_BUILD_MODES || (exports.ANDROID_BUILD_MODES = {}));
//# sourceMappingURL=index.js.map