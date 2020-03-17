"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const android_1 = __importDefault(require("./android"));
const ios_1 = __importDefault(require("./ios"));
function createCommand(builder) {
    return (program) => {
        return builder(program, setCommonCommandOptions);
    };
}
function setCommonCommandOptions(cmd) {
    cmd
        .option('-u --username <username>', 'username (you can also set EXPO_USERNAME env variable)')
        .option('-p --password <password>', 'password (you can also set EXPO_PASSWORD env variable)')
        .option('-d --build-dir <build-dir>', 'directory for build artifact (default: `~/expo-apps`)')
        .option('-o --output <output-file-path>', 'output file path')
        .option('--public-url <url>', 'the URL of an externally hosted manifest (for self-hosted apps), only HTTPS URLs are supported!')
        .option('--release-channel <channel-name>', 'pull from specified release channel (default: default)')
        .option('-c --config <config-file>', 'specify a path to app.json');
}
exports.default = {
    ios: createCommand(ios_1.default),
    android: createCommand(android_1.default),
};
//# sourceMappingURL=index.js.map