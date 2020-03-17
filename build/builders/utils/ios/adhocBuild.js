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
const path_1 = __importDefault(require("path"));
const spawn_async_1 = __importDefault(require("@expo/spawn-async"));
const xdl_1 = require("@expo/xdl");
const fs_extra_1 = __importDefault(require("fs-extra"));
const sqs = __importStar(require("../../../aws/sqs"));
const BuildError_1 = __importStar(require("../../BuildError"));
const build_1 = require("../../../constants/build");
const logger_1 = __importDefault(require("../../../logger"));
const turtleContext_1 = require("../../../turtleContext");
// tslint:disable-next-line:no-var-requires
const travelingFastlane = process.platform === 'darwin' ? require('@expo/traveling-fastlane-darwin')() : null;
async function prepareAdHocBuildCredentials(job) {
    if (process.platform !== 'darwin') {
        throw new Error('This function should be called only on macOS!');
    }
    const { bundleIdentifier } = job.config;
    const { certP12, certPassword, teamId, appleSession, udids, provisioningProfileId, } = job.credentials;
    const certSerialNumber = xdl_1.IosCodeSigning.findP12CertSerialNumber(certP12, certPassword);
    const args = [
        ...(provisioningProfileId ? ['--profile-id', provisioningProfileId] : []),
        teamId,
        udids.join(','),
        bundleIdentifier,
        certSerialNumber || '__last__',
    ];
    try {
        if (provisioningProfileId) {
            logger_1.default.info(`Using ad hoc provisioning profile id: ${provisioningProfileId}`);
        }
        const credentials = await runFastlaneAction(travelingFastlane.manageAdHocProvisioningProfile, args, { env: { FASTLANE_SESSION: appleSession } });
        logger_1.default.info('New ad hoc provisioning profile successfully created');
        job.credentials.provisioningProfile = credentials.provisioningProfile;
        if (!credentials.provisioningProfileUpdateTimestamp) {
            //  dont need to persist profile because nothing changed
            return;
        }
        if (turtleContext_1.isOffline()) {
            const provisioningProfilePath = path_1.default.join(job.projectDir, `adhoc.mobileprovision`);
            await fs_extra_1.default.writeFile(provisioningProfilePath, Buffer.from(credentials.provisioningProfile, 'base64'));
            logger_1.default.info(`Saved provisioning profile to ${provisioningProfilePath}`);
        }
        else {
            await sqs.sendMessage(job.id, build_1.UPDATE_CREDENTIALS, {
                provisioningProfileId: credentials.provisioningProfileId,
                provisioningProfile: credentials.provisioningProfile,
            });
            logger_1.default.info('Ad Hoc provisioning profile sent to storage successfully');
        }
    }
    catch (e) {
        if (e instanceof BuildError_1.default) {
            logger_1.default.error('Apple Session expired! Please authenticate again using expo-cli.');
        }
        throw e;
    }
}
async function runFastlaneAction(action, args, { env }) {
    const { stderr } = await spawn_async_1.default(action, args, {
        stdio: ['inherit', 'pipe', 'pipe'],
        env: { ...process.env, ...env },
    });
    const { result, ...rest } = JSON.parse(stderr.trim());
    if (result === 'failure') {
        const { reason, rawDump, type } = rest;
        let errorMsg = `Reason: ${reason}`;
        if (rawDump) {
            errorMsg += `, raw: ${JSON.stringify(rawDump)}`;
        }
        if (type === 'session-expired') {
            throw new BuildError_1.default(BuildError_1.BuildErrorReason.SESSION_EXPIRED, errorMsg);
        }
        else {
            throw new Error(errorMsg);
        }
    }
    else {
        return rest;
    }
}
exports.default = prepareAdHocBuildCredentials;
//# sourceMappingURL=adhocBuild.js.map