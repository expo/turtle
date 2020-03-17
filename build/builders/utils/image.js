"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const sharp_1 = __importDefault(require("sharp"));
async function resizeIconWithSharpAsync(iconSizePx, iconFilename, destinationIconPath) {
    const filename = path_1.default.join(destinationIconPath, iconFilename);
    // PLEASE DON'T REMOVE THE FOLLOWING LINE (sharp caches files taking path as the cache key)
    sharp_1.default.cache(false);
    // sharp can't have same input and output filename, so load to buffer then
    // write to disk after resize is complete
    const buffer = await sharp_1.default(filename)
        .resize(iconSizePx, iconSizePx)
        .toBuffer();
    await fs_extra_1.default.writeFile(filename, buffer);
}
exports.resizeIconWithSharpAsync = resizeIconWithSharpAsync;
async function getImageDimensionsWithSharpAsync(dirname, filename) {
    const filepath = path_1.default.join(dirname, filename);
    // PLEASE DON'T REMOVE THE FOLLOWING LINE (sharp caches files taking path as the cache key)
    sharp_1.default.cache(false);
    try {
        const { width, height } = await sharp_1.default(filepath).metadata();
        return { width, height };
    }
    catch (e) {
        return null;
    }
}
exports.getImageDimensionsWithSharpAsync = getImageDimensionsWithSharpAsync;
//# sourceMappingURL=image.js.map