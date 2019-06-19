import { ANDROID_BUILD_MODES, ANDROID_BUILD_TYPES, IOS_BUILD_TYPES } from 'turtle/constants';

export interface IShellAppDirectoryConfig {
  sdkVersion: string;
  buildType?: IOS_BUILD_TYPES & ANDROID_BUILD_TYPES;
  buildMode?: ANDROID_BUILD_MODES;
}
