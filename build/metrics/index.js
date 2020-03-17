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
const cloudwatch = __importStar(require("../aws/cloudwatch"));
const logger_1 = __importDefault(require("../logger"));
const buildDuration = __importStar(require("./buildDuration"));
const buildStatus = __importStar(require("./buildStatus"));
const metricsToRegister = [buildStatus, buildDuration];
async function init() {
    logger_1.default.info('Initializing Cloudwatch metrics');
    await cloudwatch.init();
    metricsToRegister.forEach((metric) => metric.register());
}
exports.init = init;
//# sourceMappingURL=index.js.map