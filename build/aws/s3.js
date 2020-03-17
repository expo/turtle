"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const lodash_1 = __importDefault(require("lodash"));
const config_1 = __importDefault(require("../config"));
const s3 = new aws_sdk_1.default.S3({
    ...lodash_1.default.pick(config_1.default.aws, ['accessKeyId', 'secretAccessKey']),
    ...lodash_1.default.pick(config_1.default.s3, ['region']),
});
exports.default = s3;
async function uploadFile({ bucketName = config_1.default.s3.bucket, key, srcPath }) {
    return await s3
        .upload({
        Bucket: bucketName,
        Key: key,
        Body: fs_extra_1.default.createReadStream(srcPath),
    })
        .promise();
}
exports.uploadFile = uploadFile;
//# sourceMappingURL=s3.js.map