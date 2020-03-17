"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../constants");
exports.default = joi_1.default.object().keys({
    platform: joi_1.default.string().valid(Object.values(constants_1.PLATFORMS)),
    experienceName: joi_1.default.string(),
    id: joi_1.default.string().uuid(),
    manifest: joi_1.default.object().unknown(true),
    config: joi_1.default.object()
        .keys({
        releaseChannel: joi_1.default.string().regex(/[a-z\d][a-z\d._-]*/),
    })
        .unknown(true),
    projectDir: joi_1.default.string(),
    fakeUploadDir: joi_1.default.string(),
    fakeUploadBuildPath: joi_1.default.string(),
    sdkVersion: joi_1.default.string(),
    messageCreatedTimestamp: joi_1.default.number(),
});
//# sourceMappingURL=base.js.map