"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xdl_1 = require("@expo/xdl");
const version_1 = require("./builders/utils/version");
const config_1 = __importDefault(require("./config"));
const jobManager_1 = require("./jobManager");
const logger_1 = __importDefault(require("./logger"));
const setup_1 = __importDefault(require("./setup"));
const turtleContext_1 = require("./turtleContext");
const versions_1 = require("./utils/versions");
process.on('unhandledRejection', (err) => logger_1.default.error({ err }, 'Unhandled promise rejection'));
function handleExit() {
    if (turtleContext_1.checkShouldExit()) {
        logger_1.default.warn(`Received termination signal again. Forcing exit now.`);
        process.exit(1);
    }
    logger_1.default.warn(`Received termination signal. Will exit after current build. To force exit press Ctrl-C again`);
    turtleContext_1.setShouldExit();
}
process.on('SIGTERM', handleExit);
process.on('SIGINT', handleExit);
async function main() {
    logger_1.default.info('Starting Turtle... '
        + `NODE_ENV=${config_1.default.env}, PLATFORM=${config_1.default.platform}, DEPLOYMENT_ENVIRONMENT=${config_1.default.deploymentEnv}`);
    xdl_1.LoggerDetach.configure(logger_1.default);
    if (setup_1.default[config_1.default.platform]) {
        await setup_1.default[config_1.default.platform]();
    }
    try {
        await versions_1.setTurtleVersion(turtleContext_1.turtleVersion);
        logger_1.default.info(`Registered Turtle version (${turtleContext_1.turtleVersion}) in www`);
        const sdkVersions = (await version_1.findSupportedSdkVersions(config_1.default.platform)).map((version) => `${version}.0.0`);
        await versions_1.setSupportedSdkVersions(config_1.default.platform, sdkVersions);
        logger_1.default.info(`Registered supported SDK versions (${sdkVersions}) in www`);
    }
    catch (err) {
        logger_1.default.error({ err }, 'Failed to register versions in www');
    }
    while (true) {
        try {
            await jobManager_1.doJob();
        }
        catch (err) {
            logger_1.default.error({ err }, 'Failed to process a job');
        }
    }
}
main()
    .then(() => logger_1.default.error('This should never happen...'))
    .catch((err) => logger_1.default.error({ err }, 'Something went terribly wrong'))
    .then(() => process.exit(1));
//# sourceMappingURL=server.js.map