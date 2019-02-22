import { IOS } from 'turtle/constants';

export interface IShellAppDirectoryConfig {
  sdkVersion: string;
  buildType?: IOS.BUILD_TYPES;
}
