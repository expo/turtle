"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url = __importStar(require("url"));
const config_1 = __importDefault(require("../../config"));
const logger_1 = __importDefault(require("../../logger"));
function getExperienceUrl(experienceName, publicUrl) {
    // publicUrl is passed in if user wants to build an externally hosted app
    if (publicUrl) {
        return publicUrl;
    }
    const { protocol, hostname, port } = config_1.default.api;
    return url.format({ protocol, hostname, port, pathname: `/${experienceName}` });
}
exports.getExperienceUrl = getExperienceUrl;
const alreadyLoggedError = Symbol('alreadyLoggedError');
function logErrorOnce(err) {
    if (!err[alreadyLoggedError]) {
        logger_1.default.error(err.stack);
        err[alreadyLoggedError] = true;
    }
}
exports.logErrorOnce = logErrorOnce;
//# sourceMappingURL=common.js.map