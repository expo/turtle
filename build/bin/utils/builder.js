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
const url_1 = __importDefault(require("url"));
const xdl_1 = require("@expo/xdl");
const lodash_1 = __importDefault(require("lodash"));
const uuid_1 = __importDefault(require("uuid"));
const ErrorWithCommandHelp_1 = require("../commands/ErrorWithCommandHelp");
const ErrorWithProgramHelp_1 = require("../commands/ErrorWithProgramHelp");
const setup_1 = __importDefault(require("../setup/setup"));
const ProjectUtils = __importStar(require("./project"));
const UserUtils = __importStar(require("./user"));
const common_1 = require("../../builders/utils/common");
const logger_1 = __importDefault(require("../../logger"));
const validator_1 = require("../../validator");
function createBuilderAction({ program, command, prepareCredentials, builder, platform, os, }) {
    return async (projectDirArg, cmd) => {
        try {
            const osList = [];
            if (Array.isArray(os)) {
                osList.push(...os);
            }
            else {
                osList.push(os);
            }
            if (osList.length && !osList.includes(process.platform)) {
                throw new Error('We don\'t support running standalone app builds for this platform on your operating system');
            }
            if (cmd.buildDir && cmd.output) {
                throw new ErrorWithCommandHelp_1.ErrorWithCommandHelp('You can\'t provide both --build-dir and --output parameters, please choose one');
            }
            const userData = {
                username: cmd.username || process.env.EXPO_USERNAME,
                password: cmd.password || process.env.EXPO_PASSWORD,
            };
            if (userData.username || userData.password) {
                if (userData.username && userData.password) {
                    await UserUtils.ensureUserLoggedIn(userData);
                }
                else {
                    throw new ErrorWithCommandHelp_1.ErrorWithCommandHelp('You must provide both Expo username and password');
                }
            }
            else if (!cmd.publicUrl) {
                throw new ErrorWithCommandHelp_1.ErrorWithCommandHelp('You must provide your Expo username and password unless you specify --public-url to your project manifest.');
            }
            if (cmd.publicUrl) {
                const parsedPublicUrl = url_1.default.parse(cmd.publicUrl);
                if (parsedPublicUrl.protocol !== 'https:') {
                    throw new ErrorWithCommandHelp_1.ErrorWithCommandHelp('--public-url is invalid - only HTTPS urls are supported');
                }
            }
            const args = {
                releaseChannel: cmd.releaseChannel || 'default',
                buildType: cmd.type,
                buildMode: cmd.mode,
                username: userData.username || 'anonymous',
                projectDir: ProjectUtils.resolveAbsoluteDir(projectDirArg),
                publicUrl: cmd.publicUrl,
            };
            const appJSON = await ProjectUtils.loadAppJSON(projectDirArg, cmd.config);
            const sdkVersion = lodash_1.default.get(appJSON, 'expo.sdkVersion');
            await setup_1.default(platform, sdkVersion);
            const credentials = await prepareCredentials(cmd);
            const rawJob = {
                ...await buildJobObject(platform, appJSON, args, credentials),
                ...cmd.buildDir && { fakeUploadDir: ProjectUtils.resolveAbsoluteDir(cmd.buildDir) },
                ...cmd.output && { fakeUploadBuildPath: ProjectUtils.resolveAbsoluteDir(cmd.output) },
            };
            const job = await validator_1.sanitizeJob(rawJob);
            await builder(job);
        }
        catch (err) {
            logger_1.default.error({ err }, 'Failed to build standalone app');
            if (err instanceof ErrorWithCommandHelp_1.ErrorWithCommandHelp) {
                command.help();
            }
            else if (err instanceof ErrorWithProgramHelp_1.ErrorWithProgramHelp) {
                program.help();
            }
            process.exit(1);
        }
    };
}
exports.createBuilderAction = createBuilderAction;
const buildJobObject = async (platform, appJSON, { releaseChannel, buildType, buildMode, username, publicUrl, projectDir }, credentials) => {
    const experienceName = `@${lodash_1.default.get(appJSON, 'expo.owner', username)}/${lodash_1.default.get(appJSON, 'expo.slug')}`;
    const job = {
        config: {
            ...lodash_1.default.get(appJSON, `expo.${platform}.config`, {}),
            buildType,
            ...(platform === 'android' ? { buildMode } : {}),
            releaseChannel,
            ...(platform === 'ios' ? { bundleIdentifier: lodash_1.default.get(appJSON, 'expo.ios.bundleIdentifier') } : {}),
            ...(platform === 'android' ? { androidPackage: lodash_1.default.get(appJSON, 'expo.android.package') } : {}),
            publicUrl,
        },
        id: uuid_1.default.v4(),
        platform,
        projectDir,
        sdkVersion: lodash_1.default.get(appJSON, 'expo.sdkVersion'),
        experienceName,
        ...(credentials && { credentials }),
    };
    const url = common_1.getExperienceUrl(job.experienceName, job.config.publicUrl);
    const manifest = await xdl_1.ExponentTools.getManifestAsync(url, {
        'Exponent-SDK-Version': lodash_1.default.get(appJSON, 'expo.sdkVersion'),
        'Exponent-Platform': platform,
        'Expo-Release-Channel': releaseChannel,
        'Accept': 'application/expo+json,application/json',
    });
    return { ...job, manifest };
};
//# sourceMappingURL=builder.js.map