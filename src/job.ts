import { ANDROID_BUILD_MODES, ANDROID_BUILD_TYPES, IOS_BUILD_TYPES } from 'turtle/constants';

export interface IJob {
  platform: 'android' | 'ios';
  experienceName: string;
  id: string;
  manifest: any;
  sdkVersion: string;
  config: {
    releaseChannel: string;
    publicUrl?: string;
    buildType: IOS_BUILD_TYPES & ANDROID_BUILD_TYPES;
    // ios
    bundleIdentifier?: string;
    // android
    androidPackage?: string;
    buildMode?: ANDROID_BUILD_MODES;
  };
  credentials: {
    // android
    keystore?: string;
    keystoreAlias?: string;
    keystorePassword?: string;
    keyPassword?: string;
    // ios
    certP12?: string;
    certPassword?: string;
    provisioningProfile?: string;
    teamId?: string;
    appleSession?: string;
    udids?: string[];
  };
  projectDir: string;
  fakeUploadDir?: string;
  fakeUploadBuildPath?: string;
}

export interface IAndroidCredentials {
  keystore: string;
  keystoreAlias: string;
  keystorePassword: string;
  keyPassword: string;
}

export interface IJobResult {
  artifactUrl: string;
}
