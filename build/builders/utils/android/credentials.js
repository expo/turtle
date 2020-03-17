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
const xdl_1 = require("@expo/xdl");
const fs_extra_1 = __importDefault(require("fs-extra"));
const get_1 = __importDefault(require("lodash/get"));
const v4_1 = __importDefault(require("uuid/v4"));
const sqs = __importStar(require("../../../aws/sqs"));
const build_1 = require("../../../constants/build");
const logger_1 = __importDefault(require("../../../logger"));
const turtleContext_1 = require("../../../turtleContext");
async function getOrCreateCredentials(jobData) {
    if (!jobData.credentials) {
        const l = logger_1.default.child({ buildPhase: 'generating keystore' });
        const credentials = {};
        l.info('Creating keystore');
        const keystoreFilename = `/tmp/keystore-${jobData.id}.tmp.jks`;
        credentials.keystorePassword = v4_1.default().replace(/-/g, '');
        credentials.keyPassword = v4_1.default().replace(/-/g, '');
        credentials.keystoreAlias = Buffer.from(jobData.experienceName).toString('base64');
        const androidPackage = get_1.default(jobData, 'manifest.android.package')
            || get_1.default(jobData, 'config.androidPackage');
        if (!androidPackage) {
            throw new Error('Android package name is not set in the app manifest (please update app.json if you\'re using turtle-cli).');
        }
        await xdl_1.AndroidCredentials.createKeystore({
            keystorePath: keystoreFilename,
            keystorePassword: credentials.keystorePassword,
            keyPassword: credentials.keyPassword,
            keyAlias: credentials.keystoreAlias,
        }, androidPackage);
        credentials.keystore = (await fs_extra_1.default.readFile(keystoreFilename)).toString('base64');
        l.info('Keystore created successfully');
        if (turtleContext_1.isOffline()) {
            const projectKeystorePath = path_1.default.join(jobData.projectDir, `${jobData.experienceName}.jks`);
            await fs_extra_1.default.copy(keystoreFilename, projectKeystorePath);
            l.info(`Saved created keystore to ${projectKeystorePath}`);
            l.info(`Keystore password: ${credentials.keystorePassword}`);
            l.info(`Keystore alias: ${credentials.keystoreAlias}`);
            l.info(`Key password: ${credentials.keyPassword}`);
            l.info(`Please keep these credentials safe`);
        }
        else {
            await sqs.sendMessage(jobData.id, build_1.UPDATE_CREDENTIALS, {
                ...credentials,
            });
            l.info('Keystore sent to storage successfully');
        }
        await fs_extra_1.default.unlink(keystoreFilename);
        return credentials;
    }
    return jobData.credentials;
}
exports.default = getOrCreateCredentials;
//# sourceMappingURL=credentials.js.map