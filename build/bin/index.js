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
const commander_1 = __importStar(require("commander"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const commands = __importStar(require("./commands"));
const logger_1 = __importDefault(require("../logger"));
const { name, version } = JSON.parse(fs_extra_1.default.readFileSync(path_1.default.join(__dirname, '../../package.json'), 'utf-8'));
const ModuleVersionChecker = xdl_1.ModuleVersion.createModuleVersionChecker(name, version);
xdl_1.LoggerDetach.configure(logger_1.default);
commander_1.Command.prototype.asyncAction = function asyncAction(asyncFn) {
    return this.action(async (...args) => {
        try {
            await checkForUpdateAsync();
        }
        catch (err) {
            logger_1.default.warn({ err }, 'Failed to check for turtle-cli update.');
        }
        return await asyncFn(...args);
    });
};
function run(programName) {
    runAsync(programName).catch((err) => {
        logger_1.default.error({ err }, 'Uncaught Error');
        process.exit(1);
    });
}
exports.run = run;
async function runAsync(programName) {
    commander_1.default.version(version);
    Object.values(commands).forEach((command) => registerCommand(commander_1.default, command));
    commander_1.default.parse(process.argv);
    const subCommand = process.argv[2];
    if (subCommand) {
        const commandNames = commander_1.default.commands.reduce((acc, command) => {
            acc.push(command._name);
            const alias = command._alias;
            if (alias) {
                acc.push(alias);
            }
            return acc;
        }, []);
        if (!commandNames.includes(subCommand)) {
            logger_1.default.error(`"${subCommand}" is not an ${programName} command. See "${programName} --help" for the full list of commands.`);
        }
    }
    else {
        commander_1.default.help();
    }
}
const registerCommand = (prog, command) => command(prog);
async function checkForUpdateAsync() {
    const { updateIsAvailable, current, latest } = await ModuleVersionChecker.checkAsync();
    if (updateIsAvailable) {
        logger_1.default.warn(`There is a new version of ${name} available (${latest}).
You are currently using ${name} ${current}
Run \`npm install -g ${name}\` to get the latest version`);
    }
}
//# sourceMappingURL=index.js.map