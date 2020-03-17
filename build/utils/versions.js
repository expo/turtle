"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const request_promise_1 = __importDefault(require("request-promise"));
const config_1 = __importDefault(require("../config"));
async function setSupportedSdkVersions(platform, sdkVersions) {
    const { href } = new url_1.URL('/--/api/v2/standalone-build/setSupportedSDKVersions', resolveWWWEndpoint());
    await request_promise_1.default({
        method: 'POST',
        uri: href,
        headers: {
            'secret-token': config_1.default.www.sdkVersionsSecretToken,
        },
        body: {
            platform,
            sdkVersions,
        },
        json: true,
    });
}
exports.setSupportedSdkVersions = setSupportedSdkVersions;
async function setTurtleVersion(version) {
    const { href } = new url_1.URL('/--/api/v2/standalone-build/setTurtleVersion', resolveWWWEndpoint());
    await request_promise_1.default({
        method: 'POST',
        uri: href,
        headers: {
            'secret-token': config_1.default.www.sdkVersionsSecretToken,
        },
        body: {
            version,
        },
        json: true,
    });
}
exports.setTurtleVersion = setTurtleVersion;
function resolveWWWEndpoint() {
    const currentEnv = config_1.default.deploymentEnv;
    if (currentEnv === 'production') {
        return 'https://expo.io';
    }
    else if (currentEnv === 'staging') {
        return 'https://staging.expo.io';
    }
    else {
        return 'http://127.0.0.1:3000';
    }
}
//# sourceMappingURL=versions.js.map