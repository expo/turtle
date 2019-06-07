import { ANDROID_BUILD_TYPES, IOS_BUILD_TYPES } from 'turtle/constants';

export interface IShellAppDirectoryConfig {
  sdkVersion: string;
  buildType?: IOS_BUILD_TYPES & ANDROID_BUILD_TYPES;
}
