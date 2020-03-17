"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../constants");
const base_1 = __importDefault(require("./base"));
exports.default = base_1.default.concat(joi_1.default.object().keys({
    platform: joi_1.default.string().valid(constants_1.PLATFORMS.ANDROID),
    credentials: joi_1.default.object().keys({
        keystorePassword: joi_1.default.string(),
        keyPassword: joi_1.default.string(),
        keystoreAlias: joi_1.default.string(),
        keystore: joi_1.default.string(),
    }),
    config: joi_1.default.object().keys({
        buildMode: joi_1.default.string().valid(Object.values(constants_1.ANDROID_BUILD_MODES)).default(constants_1.ANDROID_BUILD_MODES.RELEASE),
        buildType: joi_1.default.string().valid(Object.values(constants_1.ANDROID_BUILD_TYPES)).default(constants_1.ANDROID_BUILD_TYPES.APK),
    }),
}));
//# sourceMappingURL=android.js.map