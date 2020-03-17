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
const xdl_1 = require("@expo/xdl");
const lodash_1 = __importDefault(require("lodash"));
const common_1 = require("../utils/common");
const fileUtils = __importStar(require("../utils/file"));
const keychain = __importStar(require("../utils/ios/keychain"));
const shellAppBuilder_1 = __importDefault(require("../utils/ios/shellAppBuilder"));
const index_1 = __importDefault(require("../../logger/index"));
async function buildArchive(ctx, job) {
    let keychainInfo;
    try {
        keychainInfo = await keychain.create(ctx);
        const { credentials } = job;
        const { certP12, certPassword } = credentials;
        await keychain.importCert(ctx, { keychainPath: keychainInfo.path, certP12, certPassword });
        const manifest = await shellAppBuilder_1.default(ctx, job);
        await buildAndSignIPA(ctx, job, keychainInfo.path, manifest);
    }
    catch (err) {
        common_1.logErrorOnce(err);
        throw err;
    }
    finally {
        if (keychainInfo) {
            await keychain.remove(ctx, keychainInfo.path);
        }
    }
}
exports.default = buildArchive;
async function buildAndSignIPA(ctx, job, keychainPath, manifest) {
    const l = index_1.default.child({ buildPhase: 'building and signing IPA' });
    l.info('building and signing IPA');
    const { credentials: { provisioningProfile, certPassword, teamId }, config: { bundleIdentifier: bundleIdentifierFromConfig }, } = job;
    const bundleIdentifierFromManifest = lodash_1.default.get(manifest, 'ios.bundleIdentifier');
    const bundleIdentifier = bundleIdentifierFromConfig || bundleIdentifierFromManifest;
    const { provisioningProfilePath } = ctx;
    await fileUtils.writeBase64ToBinaryFile(provisioningProfilePath, provisioningProfile);
    l.info('saved provisioning profile to temporary path');
    const ipaBuilder = xdl_1.IosIPABuilder({
        keychainPath,
        provisioningProfilePath,
        appUUID: ctx.appUUID,
        certPath: ctx.tempCertPath,
        certPassword,
        teamID: teamId,
        bundleIdentifier,
        workspacePath: ctx.workspacePath,
        manifest,
    });
    await ipaBuilder.build();
    l.info(`done building and signing IPA`);
}
//# sourceMappingURL=archive.js.map