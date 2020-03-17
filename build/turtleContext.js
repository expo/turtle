"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("./config"));
const { version: turtleVersion } = JSON.parse(fs_extra_1.default.readFileSync(path_1.default.join(__dirname, '../package.json'), 'utf-8'));
exports.turtleVersion = turtleVersion;
let shouldExit = false;
let currentJobId = null;
exports.setShouldExit = () => {
    shouldExit = true;
};
exports.checkShouldExit = () => {
    return shouldExit;
};
exports.getCurrentJobId = () => {
    return currentJobId;
};
exports.setCurrentJobId = (id) => {
    currentJobId = id;
};
exports.isOffline = () => config_1.default.builder.mode === 'offline';
//# sourceMappingURL=turtleContext.js.map