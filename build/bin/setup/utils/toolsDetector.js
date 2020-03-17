"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const which_1 = __importDefault(require("which"));
const logger_1 = __importDefault(require("../../../logger"));
const which = util_1.default.promisify(which_1.default);
const l = logger_1.default.child({ buildPhase: 'setting up environment' });
async function ensureToolsAreInstalled(tools) {
    let isAnyToolMissing = false;
    for (const { command, missingDescription, testFn, versionCheckFn } of tools) {
        try {
            if (testFn) {
                if (!await testFn()) {
                    throw new Error('Required tool is not properly installed');
                }
            }
            else {
                await which(command);
            }
        }
        catch (err) {
            isAnyToolMissing = true;
            if (!testFn) {
                l.error({ err }, `${command} is missing in your $PATH`);
            }
            l.error({ err }, missingDescription);
        }
        if (versionCheckFn) {
            try {
                await versionCheckFn();
            }
            catch (err) {
                isAnyToolMissing = true;
                l.error({ err }, `wrong version of ${command} installed`);
            }
        }
    }
    if (isAnyToolMissing) {
        throw new Error('Tools required to perform standalone app build are missing. Please install them.');
    }
}
exports.ensureToolsAreInstalled = ensureToolsAreInstalled;
//# sourceMappingURL=toolsDetector.js.map