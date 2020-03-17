"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
async function loadAppJSON(projectDirArg, config) {
    let appJSONPath;
    if (config) {
        appJSONPath = exports.resolveAbsoluteDir(config);
    }
    else {
        const projectDir = exports.resolveAbsoluteDir(projectDirArg);
        appJSONPath = path_1.default.join(projectDir, 'app.json');
    }
    const appJSONExists = await fs_extra_1.default.pathExists(appJSONPath);
    if (!appJSONExists) {
        throw new Error(`Couldn't find app.json.`);
    }
    else {
        return require(appJSONPath);
    }
}
exports.loadAppJSON = loadAppJSON;
exports.resolveAbsoluteDir = (dir) => {
    if (dir && path_1.default.isAbsolute(dir)) {
        return dir;
    }
    else {
        const cwd = process.env.INIT_CWD || process.cwd();
        return dir ? path_1.default.join(cwd, dir) : cwd;
    }
};
//# sourceMappingURL=project.js.map