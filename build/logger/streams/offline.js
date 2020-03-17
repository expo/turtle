"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bunyan_debug_stream_1 = __importDefault(require("bunyan-debug-stream"));
const config_1 = __importDefault(require("../../config"));
function create() {
    const prettyStdOut = new bunyan_debug_stream_1.default({ forceColor: true });
    return {
        stream: prettyStdOut,
        type: 'raw',
        level: config_1.default.logger.level,
    };
}
exports.default = create;
//# sourceMappingURL=offline.js.map