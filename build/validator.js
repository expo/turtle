"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const schemas = __importStar(require("./jobsSchemas"));
async function sanitizeJob(job) {
    const schema = schemas[job.platform];
    if (!schema) {
        throw new Error(`Unsupported platform: ${job.platform}`);
    }
    const { error, value } = schema.validate(job, { stripUnknown: true });
    if (error) {
        throw error;
    }
    else {
        return value;
    }
}
exports.sanitizeJob = sanitizeJob;
//# sourceMappingURL=validator.js.map