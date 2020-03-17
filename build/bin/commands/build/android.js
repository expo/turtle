"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const ErrorWithCommandHelp_1 = require("../ErrorWithCommandHelp");
const builder_1 = require("../../utils/builder");
const android_1 = __importDefault(require("../../../builders/android"));
const constants_1 = require("../../../constants");
exports.default = (program, setCommonCommandOptions) => {
    const command = program.command('build:android [project-dir]');
    setCommonCommandOptions(command);
    command
        .alias('ba')
        .option('--keystore-path <app.jks>', 'path to your Keystore (please provide Keystore password and Key password as EXPO_ANDROID_KEYSTORE_PASSWORD'
        + ' and EXPO_ANDROID_KEY_PASSWORD env variables)')
        .option('--keystore-alias <alias>', 'keystore Alias')
        .option('-t --type <build>', 'type of build: app-bundle|apk', /^(app-bundle|apk)$/i, 'app-bundle')
        .option('-m --mode <build>', 'type of build: debug|release', /^(debug|release)$/i, 'release')
        .description('Build a standalone APK or App Bundle for your project, either signed and ready for submission to'
        + ' the Google Play Store or in debug mode.')
        .asyncAction(builder_1.createBuilderAction({
        program,
        command,
        prepareCredentials,
        builder: android_1.default,
        platform: constants_1.PLATFORMS.ANDROID,
        os: ['darwin', 'linux'],
    }));
};
const prepareCredentials = async (cmd) => {
    const { keystorePath, keystoreAlias } = cmd;
    const keystorePassword = process.env.EXPO_ANDROID_KEYSTORE_PASSWORD;
    const keyPassword = process.env.EXPO_ANDROID_KEY_PASSWORD;
    const someCredentialsExist = keystorePath || keystoreAlias || keystorePassword || keyPassword;
    const credentialsExist = keystorePath && keystoreAlias && keystorePassword && keyPassword;
    if (!credentialsExist) {
        if (someCredentialsExist) {
            throw new ErrorWithCommandHelp_1.ErrorWithCommandHelp('Please provide all required credentials - Keystore (with password), Keystore alias and Key password');
        }
        else {
            return null;
        }
    }
    else {
        return {
            keystore: (await fs_extra_1.default.readFile(keystorePath)).toString('base64'),
            keystoreAlias,
            keystorePassword,
            keyPassword,
        };
    }
};
//# sourceMappingURL=android.js.map