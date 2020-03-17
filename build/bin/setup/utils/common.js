"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const xdl_1 = require("@expo/xdl");
const fs_extra_1 = __importDefault(require("fs-extra"));
const tar_1 = __importDefault(require("tar"));
const downloader_1 = __importDefault(require("./downloader"));
const toolsDetector_1 = require("./toolsDetector");
const config_1 = __importDefault(require("../../../config"));
const logger_1 = __importDefault(require("../../../logger"));
const l = logger_1.default.child({ buildPhase: 'setting up environment' });
async function checkSystem(requiredTools) {
    await toolsDetector_1.ensureToolsAreInstalled(requiredTools);
}
exports.checkSystem = checkSystem;
async function ensureShellAppIsPresent(sdkVersion, formatters, postDownloadAction) {
    const workingdir = formatters.formatShellAppDirectory({ sdkVersion });
    const shellAppMetadata = await _readShellAppTarballS3Uri(sdkVersion, formatters);
    await removeDirectoryUnlessReady(workingdir, shellAppMetadata);
    if (await fs_extra_1.default.pathExists(workingdir)) {
        return;
    }
    l.info(`shell app for SDK ${sdkVersion} doesn't exist, downloading...`);
    await _downloadShellApp(sdkVersion, workingdir, formatters);
    if (postDownloadAction) {
        await postDownloadAction(sdkVersion, workingdir);
    }
    await markDirectoryAsReady(workingdir, shellAppMetadata);
}
exports.ensureShellAppIsPresent = ensureShellAppIsPresent;
async function _downloadShellApp(sdkVersion, targetDirectory, formatters) {
    const shellAppTarballS3Uri = await _readShellAppTarballS3Uri(sdkVersion, formatters);
    const tarballDownloadTargetPath = formatArtifactDownloadPath(shellAppTarballS3Uri);
    await fs_extra_1.default.ensureDir(config_1.default.directories.artifactsDir);
    await downloader_1.default(shellAppTarballS3Uri, tarballDownloadTargetPath);
    l.info('shell app has been downloaded');
    await fs_extra_1.default.ensureDir(targetDirectory);
    l.info('extracting shell app (this may take a while)...');
    await tar_1.default.x({
        file: tarballDownloadTargetPath,
        C: targetDirectory,
    });
    l.info('shell app extracted');
}
function formatArtifactDownloadPath(uri) {
    const { base } = path_1.default.parse(uri);
    return path_1.default.join(config_1.default.directories.artifactsDir, base);
}
exports.formatArtifactDownloadPath = formatArtifactDownloadPath;
async function _readShellAppTarballS3Uri(sdkVersion, formatters) {
    const sdkMajorVersion = xdl_1.ExponentTools.parseSdkMajorVersion(sdkVersion);
    const filePath = formatters.formatShellAppTarballUriPath(sdkMajorVersion);
    const data = await fs_extra_1.default.readFile(filePath, 'utf8');
    return data.trim();
}
async function removeDirectoryUnlessReady(dir, metadata) {
    const readyFilePath = path_1.default.join(dir, '.ready');
    const readyFileExists = await fs_extra_1.default.pathExists(readyFilePath);
    let shouldRemove = false;
    if (readyFileExists) {
        if (metadata !== undefined) {
            const readyFileContents = (await fs_extra_1.default.readFile(readyFilePath, 'utf-8')).trim();
            if (readyFileContents !== metadata) {
                shouldRemove = true;
            }
        }
    }
    else {
        shouldRemove = true;
    }
    if (shouldRemove) {
        await fs_extra_1.default.remove(dir);
    }
}
exports.removeDirectoryUnlessReady = removeDirectoryUnlessReady;
async function markDirectoryAsReady(dir, metadata) {
    const readyFilePath = path_1.default.join(dir, '.ready');
    if (metadata === undefined) {
        await fs_extra_1.default.open(readyFilePath, 'w');
    }
    else {
        await fs_extra_1.default.writeFile(readyFilePath, metadata);
    }
}
exports.markDirectoryAsReady = markDirectoryAsReady;
//# sourceMappingURL=common.js.map