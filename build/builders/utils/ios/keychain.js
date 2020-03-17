"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xdl_1 = require("@expo/xdl");
const fileUtils = __importStar(require("../file"));
const logger_1 = __importDefault(require("../../../logger"));
async function create(ctx) {
    const l = logger_1.default.child({ buildPhase: 'creating keychain' });
    try {
        l.info('creating keychain...');
        const keychainInfo = await xdl_1.IosKeychain.createKeychain(ctx.appUUID, false);
        l.info('done creating keychain');
        return keychainInfo;
    }
    catch (err) {
        l.error({ err }, 'unable to create keychain');
        throw err;
    }
}
exports.create = create;
async function remove(ctx, keychainPath) {
    const l = logger_1.default.child({ buildPhase: 'deleting keychain' });
    try {
        l.info('delete keychain...');
        const keychainInfo = await xdl_1.IosKeychain.deleteKeychain({
            path: keychainPath,
            appUUID: ctx.appUUID,
        });
        l.info('done deleting keychain');
        return keychainInfo;
    }
    catch (err) {
        l.error({ err }, 'unable to delete keychain');
        throw err;
    }
}
exports.remove = remove;
async function cleanUp() {
    await xdl_1.IosKeychain.cleanUpKeychains();
}
exports.cleanUp = cleanUp;
async function importCert(ctx, { keychainPath, certP12, certPassword, }) {
    const l = logger_1.default.child({ buildPhase: 'importing certificate into keychain' });
    try {
        l.info('importing distribution certificate into keychain...');
        const { tempCertPath: certPath } = ctx;
        await fileUtils.writeBase64ToBinaryFile(certPath, certP12);
        await xdl_1.IosKeychain.importIntoKeychain({ keychainPath, certPath, certPassword });
        l.info('done importing distribution certificate into keychain');
    }
    catch (err) {
        l.error({ err }, 'unable to import distribution certificate into keychain');
        throw err;
    }
}
exports.importCert = importCert;
//# sourceMappingURL=keychain.js.map