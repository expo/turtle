/*
 *  StandaloneBuildFlags is owned by a StandaloneContext and carries information about
 *  how to compile native code during the build step.
 */

type StandaloneBuildConfiguration = 'Debug' | 'Release';
interface IStandaloneBuildAndroidFlags {
  keystore: string;
  keystorePassword: string;
  keyAlias: string;
  keyPassword: string;
  outputFile: string | null;
}
interface IStandaloneBuildIosFlags {
  workspaceSourcePath: string;
  appleTeamId: string | null;
  buildType?: string;
  bundleExecutable?: string;
}

class StandaloneBuildFlags {
  public static createEmpty = () => {
    return new StandaloneBuildFlags();
  }

  public static createIos = (
    configuration: StandaloneBuildConfiguration,
    ios?: IStandaloneBuildIosFlags,
  ): StandaloneBuildFlags => {
    const flags = new StandaloneBuildFlags();
    flags.configuration = configuration;
    flags.ios = ios;
    flags.isExpoClientBuild = () => ios?.buildType === 'client';
    return flags;
  }

  public static createAndroid = (
    configuration: StandaloneBuildConfiguration,
    android?: IStandaloneBuildAndroidFlags,
  ): StandaloneBuildFlags => {
    const flags = new StandaloneBuildFlags();
    flags.configuration = configuration;
    flags.android = android;
    flags.isExpoClientBuild = () => false;
    return flags;
  }
  public configuration: StandaloneBuildConfiguration = 'Debug';
  public android?: IStandaloneBuildAndroidFlags;
  public ios?: IStandaloneBuildIosFlags;
  public isExpoClientBuild: () => boolean = () => false;
}

export default StandaloneBuildFlags;
