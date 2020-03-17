"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../logger"));
const common_1 = __importDefault(require("./common"));
async function setup() {
    logger_1.default.info('Setting up environment...');
    await common_1.default();
    logger_1.default.info('Finished setting up environment');
}
exports.default = setup;
//# sourceMappingURL=android.js.map