export interface IJob {
  platform: 'android' | 'ios';
  experienceName: string;
  id: string;
  manifest: any;
  sdkVersion: string;
  config: {
    releaseChannel: string;
    turtleVersion?: string;
    publicUrl?: string;
    // ios
    buildType?: string;
    bundleIdentifier?: string;
  };
  credentials: {
    // android
    keystore?: string;
    keystoreAlias?: string;
    keystorePassword?: string;
    // ios
    keyPassword?: string;
    certP12?: string;
    certPassword?: string;
    provisioningProfile?: string;
    password?: string;
    teamId?: string;
  };
  projectDir: string;
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
