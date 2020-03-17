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
const fs_extra_1 = __importDefault(require("fs-extra"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const keychain = __importStar(require("../builders/utils/ios/keychain"));
const logger_1 = __importDefault(require("../logger"));
const common_1 = __importDefault(require("./common"));
async function deleteProvisioningProfilesFromHomedir() {
    const provisioningProfilesDir = path_1.default.join(os_1.default.homedir(), 'Library/MobileDevice/Provisioning Profiles');
    const exists = await fs_extra_1.default.pathExists(provisioningProfilesDir);
    if (exists) {
        const provisioningProfiles = (await fs_extra_1.default.readdir(provisioningProfilesDir)).filter((filename) => path_1.default.extname(filename) === '.mobileprovision');
        await Promise.all(provisioningProfiles.map((file) => fs_extra_1.default.remove(path_1.default.join(provisioningProfilesDir, file))));
    }
}
async function setup() {
    logger_1.default.info('Setting up environment...');
    await deleteProvisioningProfilesFromHomedir();
    await keychain.cleanUp();
    await common_1.default();
    logger_1.default.info('Finished setting up environment');
}
exports.default = setup;
//# sourceMappingURL=ios.js.map