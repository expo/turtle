import fs from 'fs-extra';
import filter from 'lodash/filter';
import keys from 'lodash/keys';
import merge from 'lodash/merge';
import values from 'lodash/values';
import path from 'path';
import semver from 'semver';
import logger from 'turtle/logger';

export interface IUnimoduleEntry {
  name: string;
  version: string;
  dirname: string;
}

interface IPackageInfo {
  name: string;
  version: string;
  dirname: string; // could be different than name
  dependencies: string[];
}

export async function resolveExplicitOptIn(
  workingdir: string,
  packages?: string[],
): Promise<IUnimoduleEntry[]> {
  const resolver = new Resolver(workingdir);
  await resolver.init();

  const optionalModules = ['expo-branch'];
  resolver.addAll();
  const modules = packages
    ? resolver
        .getModules()
        .filter(
          (mod) =>
            !optionalModules.includes(mod.name) || packages.includes(mod.name),
        )
    : resolver
        .getModules()
        .filter((mod) => !optionalModules.includes(mod.name));

  modules.forEach(({ name, version }) => {
    logger.info(`Adding ${name}:${version}`);
  });
  return modules;
}

export async function resolveNativeModules(
  workingdir: string,
  sdkVersion: string,
  packages?: string[],
): Promise<IUnimoduleEntry[]> {
  const resolver = new Resolver(workingdir);
  await resolver.init();

  if (!packages) {
    resolver.addAll();
  } else {
    const corePackages = await readCorePackages(workingdir);

    // expo-notifications is required for shell apps in SDK >= 39
    // https://github.com/expo/expo/issues/10569
    if (semver.gte(sdkVersion, '39.0.0')) {
      resolver.addModule('expo-notifications');
    }

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
  modules.forEach(({ name, version }) => {
    logger.info(`Adding ${name}:${version}`);
  });
  return modules;
}

async function readCorePackages(workingdir: string) {
  const pkgJsonPath = path.join(
    workingdir,
    'node_modules',
    'react-native-unimodules',
    'package.json',
  );
  const expoPkgJsonPath = path.join(
    workingdir,
    'packages',
    'expo',
    'package.json',
  );
  if (
    (await fs.pathExists(pkgJsonPath)) &&
    (await fs.pathExists(expoPkgJsonPath))
  ) {
    const packageJson = JSON.parse(await fs.readFile(pkgJsonPath, 'utf-8'));
    const expoPackageJson = JSON.parse(
      await fs.readFile(expoPkgJsonPath, 'utf-8'),
    );
    return keys(packageJson.dependencies).concat(
      keys(expoPackageJson.dependencies),
    );
  } else {
    logger.warn('No core packages detected');
    return [];
  }
}

interface IDependencyInfo {
  [key: string]: IPackageInfo;
}

class Resolver {
  private workingdir: string;
  private modulesMap: { [key: string]: IUnimoduleEntry };
  private dependencyMap: IDependencyInfo;

  constructor(workingdir: string) {
    this.workingdir = workingdir;
    this.modulesMap = {};
    this.dependencyMap = {};
  }

  public async init() {
    this.dependencyMap = await generateDependenciesInfo(this.workingdir);
  }

  public isUnimodule(moduleName: string): boolean {
    return !!this.dependencyMap[moduleName];
  }

  public addAll() {
    for (const moduleName of Object.keys(this.dependencyMap)) {
      this.addModule(moduleName);
    }
  }

  public addModule(moduleName: string) {
    if (this.dependencyMap[moduleName]) {
      this.resolveModule(moduleName);
    } else {
      throw new Error('Attempting to add unknown module');
    }
  }

  public getModules(): IUnimoduleEntry[] {
    return values(this.modulesMap);
  }

  private async resolveModule(moduleName: string) {
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

async function generateDependenciesInfo(
  workingdir: string,
): Promise<IDependencyInfo> {
  const dir = await fs.readdir(path.join(workingdir, 'packages'));
  const map: IDependencyInfo = {};

  // scrap directory for package metadata
  for (const pkgName of dir) {
    const pkg = await getPackage(workingdir, pkgName);
    if (pkg) {
      map[pkg.name] = pkg;
    }
  }

  // handle @unimodules directory
  const unimodulesDir = await fs.readdir(
    path.join(workingdir, 'packages', '@unimodules'),
  );
  for (const pkgName of unimodulesDir) {
    const pkg = await getPackage(workingdir, path.join('@unimodules', pkgName));
    if (pkg) {
      map[pkg.name] = pkg;
    }
  }

  // remove non unimodule dependencies
  for (const pkg of Object.keys(map)) {
    map[pkg].dependencies = filter(map[pkg].dependencies, (dep) => !!map[dep]);
  }
  return map;
}

async function getPackage(
  workingdir: string,
  pkgName: string,
): Promise<IPackageInfo | null> {
  const pkgPath = path.join(workingdir, 'packages', pkgName);
  const isAndroid = await fs.pathExists(path.join(pkgPath, 'android'));
  const isIos = await fs.pathExists(path.join(pkgPath, 'ios'));
  const isUnimodule =
    (await fs.pathExists(path.join(pkgPath, 'unimodule.json'))) ||
    (await fs.pathExists(path.join(pkgPath, 'expo-module.config.json')));
  const hasPackageJson = await fs.pathExists(
    path.join(pkgPath, 'package.json'),
  );
  if (!isUnimodule || !hasPackageJson || (!isAndroid && !isIos)) {
    return null;
  }

  const packageJson = JSON.parse(
    await fs.readFile(path.join(pkgPath, 'package.json'), 'utf-8'),
  );

  const pkgDeps = merge(
    {}, // reading everything to make sure
    packageJson.dependencies,
    packageJson.peerDependencies,
    packageJson.unimodulePeerDependencies,
  );
  const info: IPackageInfo = {
    name: packageJson.name,
    version: packageJson.version,
    dirname: pkgName,
    dependencies: Object.keys(pkgDeps),
  };

  return info;
}
