"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
async function writeBase64ToBinaryFile(filename, base64) {
    const buffer = Buffer.from(base64, 'base64');
    await fs_extra_1.default.writeFile(filename, buffer);
}
exports.writeBase64ToBinaryFile = writeBase64ToBinaryFile;
//# sourceMappingURL=file.js.map