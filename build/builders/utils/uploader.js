"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
const s3_1 = require("../../aws/s3");
const config_1 = __importDefault(require("../../config"));
const logger_1 = __importDefault(require("../../logger"));
async function uploadBuildToS3(ctx) {
    if (config_1.default.builder.fakeUpload) {
        const l = logger_1.default.child({ buildPhase: 'copying build artifact' });
        const { fakeUploadBuildPath, uploadPath } = ctx;
        l.info('copying build to fake upload directory');
        await fs.copy(uploadPath, fakeUploadBuildPath);
        l.info(`copied build to ${fakeUploadBuildPath}`);
        return fakeUploadBuildPath;
    }
    else {
        const l = logger_1.default.child({ buildPhase: 'uploading to S3' });
        l.info('uploading build artifact to S3');
        const { Location: fileLocation } = await s3_1.uploadFile({
            key: ctx.s3FileKey,
            srcPath: ctx.uploadPath,
        });
        l.info(`done uploading build artifact to S3 (${fileLocation})`);
        return fileLocation;
    }
}
exports.uploadBuildToS3 = uploadBuildToS3;
//# sourceMappingURL=uploader.js.map