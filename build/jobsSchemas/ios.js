"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const index_1 = require("../constants/index");
const base_1 = __importDefault(require("./base"));
exports.default = base_1.default.concat(joi_1.default.object().keys({
    platform: joi_1.default.string().valid(index_1.PLATFORMS.IOS),
    config: joi_1.default.object().keys({
        buildType: joi_1.default.string().default(index_1.IOS_BUILD_TYPES.ARCHIVE),
        bundleIdentifier: joi_1.default.string().regex(/^[a-zA-Z][a-zA-Z0-9\-.]+$/),
    }),
    credentials: joi_1.default.object()
        .keys({
        certP12: joi_1.default.string().required(),
        certPassword: joi_1.default.string().required(),
        teamId: joi_1.default.string().required(),
        // it's not required for adhoc Expo Client builds
        provisioningProfile: joi_1.default.string(),
        provisioningProfileId: joi_1.default.string(),
        appleSession: joi_1.default.string(),
        udids: joi_1.default.array().items(joi_1.default.string()),
    })
        .when('config.buildType', {
        is: index_1.IOS_BUILD_TYPES.SIMULATOR,
        then: joi_1.default.optional(),
        otherwise: joi_1.default.required(),
    }),
}));
//# sourceMappingURL=ios.js.map