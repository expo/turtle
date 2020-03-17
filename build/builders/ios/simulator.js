"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shellAppBuilder_1 = __importDefault(require("../utils/ios/shellAppBuilder"));
const logger_1 = __importDefault(require("../../logger"));
async function buildSimulator(ctx, job) {
    const l = logger_1.default.child({ buildPhase: 'running simulator builder' });
    l.info('running simulator build');
    await shellAppBuilder_1.default(ctx, job);
    l.info('build complete');
}
exports.default = buildSimulator;
//# sourceMappingURL=simulator.js.map