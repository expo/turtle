"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const filter_1 = __importDefault(require("lodash/filter"));
const keys_1 = __importDefault(require("lodash/keys"));
const merge_1 = __importDefault(require("lodash/merge"));
const values_1 = __importDefault(require("lodash/values"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("../../logger"));
async function resolveExplicitOptIn(workingdir, packages) {
    const resolver = new Resolver(workingdir);
    await resolver.init();
    const optionalModules = ['expo-branch'];
    resolver.addAll();
    const modules = packages
        ? resolver.getModules().filter((mod) => !optionalModules.includes(mod.name) || packages.includes(mod.name))
        : resolver.getModules().filter((mod) => !optionalModules.includes(mod.name));
    modules.forEach(({ name, version }) => { logger_1.default.info(`Adding ${name}:${version}`); });
    return modules;
}
exports.resolveExplicitOptIn = resolveExplicitOptIn;
async function resolveNativeModules(workingdir, packages) {
    const resolver = new Resolver(workingdir);
    await resolver.init();
    if (!packages) {
        resolver.addAll();
    }
    else {
        const corePackages = await readCorePackages(workingdir);
        for (const pkg of corePackages) {
            if (resolver.isUnimodule(pkg)) {
                resolver.addModule(pkg);
            }
        }
        for (const pkg of packages) {
            if (resolver.isUnimodule(pkg)) {
                resolver.addModule(pkg);
            }
        }
    }
    const modules = resolver.getModules();
    modules.forEach(({ name, version }) => { logger_1.default.info(`Adding ${name}:${version}`); });
    return modules;
}
exports.resolveNativeModules = resolveNativeModules;
async function readCorePackages(workingdir) {
    const pkgJsonPath = path_1.default.join(workingdir, 'node_modules', 'react-native-unimodules', 'package.json');
    const expoPkgJsonPath = path_1.default.join(workingdir, 'packages', 'expo', 'package.json');
    if (await fs_extra_1.default.pathExists(pkgJsonPath) && await fs_extra_1.default.pathExists(expoPkgJsonPath)) {
        const packageJson = JSON.parse(await fs_extra_1.default.readFile(pkgJsonPath, 'utf-8'));
        const expoPackageJson = JSON.parse(await fs_extra_1.default.readFile(expoPkgJsonPath, 'utf-8'));
        return keys_1.default(packageJson.dependencies).concat(keys_1.default(expoPackageJson.dependencies));
    }
    else {
        logger_1.default.warn('No core packages detected');
        return [];
    }
}
class Resolver {
    constructor(workingdir) {
        this.workingdir = workingdir;
        this.modulesMap = {};
        this.dependencyMap = {};
    }
    async init() {
        this.dependencyMap = await generateDependenciesInfo(this.workingdir);
    }
    isUnimodule(moduleName) {
        return !!this.dependencyMap[moduleName];
    }
    addAll() {
        for (const moduleName of Object.keys(this.dependencyMap)) {
            this.addModule(moduleName);
        }
    }
    addModule(moduleName) {
        if (this.dependencyMap[moduleName]) {
            this.resolveModule(moduleName);
        }
        else {
            throw new Error('Attempting to add unknown module');
        }
    }
    getModules() {
        return values_1.default(this.modulesMap);
    }
    async resolveModule(moduleName) {
        if (this.modulesMap[moduleName]) {
            return;
        }
        const pkg = this.dependencyMap[moduleName];
        this.modulesMap[moduleName] = {
            name: pkg.name,
            dirname: pkg.dirname,
            version: pkg.version,
        };
        for (const dep of pkg.dependencies) {
            this.resolveModule(dep);
        }
    }
}
async function generateDependenciesInfo(workingdir) {
    const dir = await fs_extra_1.default.readdir(path_1.default.join(workingdir, 'packages'));
    const map = {};
    // scrap directory for package metadata
    for (const pkgName of dir) {
        const pkg = await getPackage(workingdir, pkgName);
        if (pkg) {
            map[pkg.name] = pkg;
        }
    }
    // handle @unimodules directory
    const unimodulesDir = await fs_extra_1.default.readdir(path_1.default.join(workingdir, 'packages', '@unimodules'));
    for (const pkgName of unimodulesDir) {
        const pkg = await getPackage(workingdir, path_1.default.join('@unimodules', pkgName));
        if (pkg) {
            map[pkg.name] = pkg;
        }
    }
    // remove non unimodule dependencies
    for (const pkg of Object.keys(map)) {
        map[pkg].dependencies = filter_1.default(map[pkg].dependencies, (dep) => !!map[dep]);
    }
    return map;
}
async function getPackage(workingdir, pkgName) {
    const pkgPath = path_1.default.join(workingdir, 'packages', pkgName);
    const isAndroid = await fs_extra_1.default.pathExists(path_1.default.join(pkgPath, 'android'));
    const isIos = await fs_extra_1.default.pathExists(path_1.default.join(pkgPath, 'ios'));
    const isUnimodule = await fs_extra_1.default.pathExists(path_1.default.join(pkgPath, 'unimodule.json'));
    const hasPackageJson = await fs_extra_1.default.pathExists(path_1.default.join(pkgPath, 'package.json'));
    if (!isUnimodule || !hasPackageJson || (!isAndroid && !isIos)) {
        return null;
    }
    const packageJson = JSON.parse(await fs_extra_1.default.readFile(path_1.default.join(pkgPath, 'package.json'), 'utf-8'));
    const pkgDeps = merge_1.default({}, // reading everything to make sure
    packageJson.dependencies, packageJson.peerDependencies, packageJson.unimodulePeerDependencies);
    const info = {
        name: packageJson.name,
        version: packageJson.version,
        dirname: pkgName,
        dependencies: Object.keys(pkgDeps),
    };
    return info;
}
//# sourceMappingURL=unimodules.js.map