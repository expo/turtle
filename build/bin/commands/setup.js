"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const ErrorWithCommandHelp_1 = require("./ErrorWithCommandHelp");
const ErrorWithProgramHelp_1 = require("./ErrorWithProgramHelp");
const setup_1 = __importDefault(require("../setup/setup"));
const constants_1 = require("../../constants");
const logger_1 = __importDefault(require("../../logger"));
const l = logger_1.default.child({ buildPhase: 'setting up environment' });
function createSetupCommand(platform, os) {
    return (program) => {
        const command = program.command(`setup:${platform}`);
        const platformFirstLetter = platform[0];
        command
            .alias(`s${platformFirstLetter}`)
            .description(`Setup environment for building ${lodash_1.default.capitalize(platform)} standalone apps.`)
            .option('--sdk-version <sdk-version>', 'version of Expo SDK shell app to download (optional)')
            .asyncAction(async (cmd) => await setupAction(program, cmd, platform, os));
    };
}
async function setupAction(program, cmd, platform, os) {
    try {
        if (os && process.platform !== os) {
            throw new Error('We don\'t support running standalone app builds for this platform on your operating system');
        }
        const { sdkVersion } = cmd;
        await setup_1.default(platform, sdkVersion);
        l.info('it\'s all set!');
    }
    catch (err) {
        logger_1.default.error({ err }, `Failed to setup environment for ${platform} builds`);
        if (err instanceof ErrorWithCommandHelp_1.ErrorWithCommandHelp) {
            cmd.help();
        }
        else if (err instanceof ErrorWithProgramHelp_1.ErrorWithProgramHelp) {
            program.help();
        }
        process.exit(1);
    }
}
exports.default = {
    ios: createSetupCommand(constants_1.PLATFORMS.IOS, 'darwin'),
    android: createSetupCommand(constants_1.PLATFORMS.ANDROID),
};
//# sourceMappingURL=setup.js.map