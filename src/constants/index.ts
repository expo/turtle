import * as BUILD from './build';

export enum PLATFORMS {
  IOS = 'ios',
  ANDROID = 'android',
}

export enum IOS_BUILD_TYPES {
  ARCHIVE = 'archive',
  CLIENT = 'client',
  SIMULATOR = 'simulator',
}

export enum ANDROID_BUILD_TYPES {
  APK = 'apk',
  APP_BUNDLE = 'app-bundle',
}

export enum ANDROID_BUILD_MODES {
  DEBUG = 'debug',
  RELEASE = 'release',
}

export { BUILD };
