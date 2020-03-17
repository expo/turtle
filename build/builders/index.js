"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const android_1 = __importDefault(require("./android"));
const ios_1 = __importDefault(require("./ios"));
exports.default = {
    ios: ios_1.default,
    android: android_1.default,
};
//# sourceMappingURL=index.js.map