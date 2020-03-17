"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const ErrorWithCommandHelp_1 = require("../ErrorWithCommandHelp");
const builder_1 = require("../../utils/builder");
const ios_1 = __importDefault(require("../../../builders/ios"));
const constants_1 = require("../../../constants");
exports.default = (program, setCommonCommandOptions) => {
    const command = program.command('build:ios [project-dir]');
    setCommonCommandOptions(command);
    command
        .alias('bi')
        .option('-t --type <build>', 'type of build: archive|simulator', /^(archive|simulator)$/i, 'archive')
        .option('--team-id <apple-teamId>', 'Apple Team ID')
        .option('--dist-p12-path <dist.p12>', 'path to your Distribution Certificate P12 (please provide password as EXPO_IOS_DIST_P12_PASSWORD env variable)')
        .option('--provisioning-profile-path <.mobileprovision>', 'path to your Provisioning Profile')
        .description('Build a standalone IPA for your project, signed and ready for submission to the Apple App Store.')
        .asyncAction(builder_1.createBuilderAction({
        program,
        command,
        prepareCredentials,
        builder: ios_1.default,
        platform: constants_1.PLATFORMS.IOS,
        os: 'darwin',
    }));
};
const prepareCredentials = async (cmd) => {
    if (cmd.type !== constants_1.IOS_BUILD_TYPES.ARCHIVE) {
        return null;
    }
    const { teamId, distP12Path, provisioningProfilePath } = cmd;
    const certPassword = process.env.EXPO_IOS_DIST_P12_PASSWORD;
    const credentialsExist = teamId && distP12Path && certPassword && provisioningProfilePath;
    if (!credentialsExist) {
        throw new ErrorWithCommandHelp_1.ErrorWithCommandHelp('Please provide all required credentials'
            + '- Apple Team ID, Distribution Certificate P12 (with password) and Provisioning Profile');
    }
    return {
        teamId,
        certP12: (await fs_extra_1.default.readFile(distP12Path)).toString('base64'),
        certPassword,
        provisioningProfile: (await fs_extra_1.default.readFile(provisioningProfilePath)).toString('base64'),
    };
};
//# sourceMappingURL=ios.js.map