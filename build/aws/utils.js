"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config"));
exports.QUEUE_URL = (priority) => config_1.default.sqs.queues[priority][config_1.default.platform];
exports.OUTPUT_QUEUE_URL = () => config_1.default.sqs.queues.out;
//# sourceMappingURL=utils.js.map