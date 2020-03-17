"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const build_1 = __importDefault(require("./build"));
const setup_1 = __importDefault(require("./setup"));
exports.setupIOS = setup_1.default.ios;
exports.setupAndroid = setup_1.default.android;
exports.buildIOS = build_1.default.ios;
exports.buildAndroid = build_1.default.android;
//# sourceMappingURL=index.js.map