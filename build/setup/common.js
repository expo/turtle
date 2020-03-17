"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../logger"));
const metrics = __importStar(require("../metrics"));
const buildersConfig_1 = __importDefault(require("../metrics/buildersConfig"));
async function commonSetup() {
    announceBuildersConfig();
    await metrics.init();
    await fs_extra_1.default.remove(config_1.default.directories.temporaryFilesRoot);
    await fs_extra_1.default.remove(config_1.default.directories.tempS3LogsDir);
}
exports.default = commonSetup;
async function announceBuildersConfig() {
    try {
        await buildersConfig_1.default();
    }
    catch (err) {
        logger_1.default.error({ err }, 'Failed to send metrics to Datadog');
    }
    finally {
        setTimeout(announceBuildersConfig, config_1.default.datadog.intervalMs);
    }
}
//# sourceMappingURL=common.js.map