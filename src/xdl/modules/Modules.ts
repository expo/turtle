import semver from 'semver';

import {
  expoSdkUniversalModulesConfigs,
  IModuleConfig,
  INativeConfig,
  vendoredNativeModules,
} from './config';

type PlatformSpecificModuleConfig = IModuleConfig & INativeConfig;
type Platform = 'ios' | 'android';

const HIGHEST_KNOWN_VERSION = '10000.0.0';

export function getAllNativeModules() {
  return [...expoSdkUniversalModulesConfigs, ...vendoredNativeModules].filter(
    (moduleConfig) => moduleConfig.isNativeModule,
  );
}

export function getAllForPlatform(
  platform: Platform,
  sdkVersion: string,
): PlatformSpecificModuleConfig[] {
  return expoSdkUniversalModulesConfigs
    .filter((moduleConfig: IModuleConfig) =>
      doesVersionSatisfy(sdkVersion, moduleConfig.sdkVersions),
    )
    .map((moduleConfig: IModuleConfig) => ({
      ...moduleConfig,
      ...moduleConfig.config[platform],
    }));
}

export function getAllNativeForExpoClientOnPlatform(
  platform: Platform,
  sdkVersion: string,
): PlatformSpecificModuleConfig[] {
  return getAllForPlatform(platform, sdkVersion).filter(
    (moduleConfig) =>
      moduleConfig.includeInExpoClient && moduleConfig.isNativeModule,
  );
}

export function getVersionableModulesForPlatform(
  platform: Platform,
  sdkVersion: string,
): PlatformSpecificModuleConfig[] {
  return getAllNativeForExpoClientOnPlatform(platform, sdkVersion).filter(
    (moduleConfig) => {
      return moduleConfig.versionable;
    },
  );
}

export function getDetachableModules(
  platform: Platform,
  sdkVersion: string,
): PlatformSpecificModuleConfig[] {
  return getAllForPlatform(platform, sdkVersion).filter(
    (moduleConfig) => moduleConfig.isNativeModule && moduleConfig.detachable,
  );
}

export function getPublishableModules(sdkVersion: string): IModuleConfig[] {
  return expoSdkUniversalModulesConfigs.filter(
    (moduleConfig: IModuleConfig) =>
      !!moduleConfig.libName &&
      doesVersionSatisfy(sdkVersion, moduleConfig.sdkVersions),
  );
}

export function doesVersionSatisfy(
  version: string,
  versionRequirement: string,
): boolean {
  if (version === 'UNVERSIONED') {
    return semver.satisfies(HIGHEST_KNOWN_VERSION, versionRequirement);
  }

  return semver.satisfies(version, versionRequirement);
}
