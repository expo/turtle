interface pbxFile {
  basename: string;
  lastKnownFileType?: string;
  group?: string;
  path?: string;
  fileEncoding?: number;
  defaultEncoding?: number;
  sourceTree: string;
  includeInIndex?: number;
  explicitFileType?: unknown;
  settings?: object;
  uuid?: string;
  fileRef: string;
  target?: string;
}

declare module 'xcode' {
  /**
   * UUID that is a key to each fragment of PBXProject.
   */
  type UUID = string;

  /**
   * if has following format `${UUID}_comment`
   */
  type UUIDComment = string;

  type XCObjectType =
    | 'PBXBuildFile'
    | 'PBXFileReference'
    | 'PBXFrameworksBuildPhase'
    | 'PBXGroup'
    | 'PBXNativeTarget'
    | 'PBXProject'
    | 'PBXResourcesBuildPhase'
    | 'PBXShellScriptBuildPhase'
    | 'PBXSourcesBuildPhase'
    | 'PBXVariantGroup'
    | 'XCBuildConfiguration'
    | 'XCConfigurationList';

  type PBXFile = pbxFile;

  interface PBXProject {
    isa: 'PBXProject';
    attributes: {
      LastUpgradeCheck: number;
      TargetAttributes: Record<
        UUID,
        {
          CreatedOnToolsVersion?: string;
          TestTargetID?: UUID;
          LastSwiftMigration?: number;
          ProvisioningStyle?: string;
        } & Record<string, undefined | number | string>
      >;
    };
    buildConfigurationList: UUID;
    buildConfigurationList_comment: string;
    compatibilityVersion: string;
    developmentRegion: string;
    hasScannedForEncodings: number;
    knownRegions: string[];
    mainGroup: UUID;
    productRefGroup: UUID;
    productRefGroup_comment: string;
    projectDirPath: string;
    projectRoot: string;
    targets: Array<{
      value: UUID;
      comment: string;
    }>;
  }

  interface PBXNativeTarget {
    isa: 'PBXNativeTarget';
    buildConfigurationList: UUID;
    buildConfigurationList_comment: string;
    buildPhases: Array<{
      value: UUID;
      comment: string;
    }>;
    buildRules: [];
    dependencies: [];
    name: string;
    productName: string;
    productReference: UUID;
    productReference_comment: string;
    productType: string;
  }

  interface PBXBuildFile {
    isa: 'PBXBuildFile';
    fileRef: UUID;
    // "AppDelegate.m"
    fileRef_comment: string;
  }

  interface XCConfigurationList {
    isa: 'XCConfigurationList';
    buildConfigurations: Array<{
      value: UUID;
      comment: string | 'Release' | 'Debug';
    }>;
    defaultConfigurationIsVisible: number;
    defaultConfigurationName: string;
  }

  interface XCBuildConfiguration {
    isa: 'XCBuildConfiguration';
    baseConfigurationReference: UUID;
    baseConfigurationReference_comment: string;
    buildSettings: Record<string, string | undefined | number | Array<unknown>> & {
      // '"$(TARGET_NAME)"',
      PRODUCT_NAME?: string;
      // '"io.expo.demo.$(PRODUCT_NAME:rfc1034identifier)"',
      PRODUCT_BUNDLE_IDENTIFIER?: string;
      PROVISIONING_PROFILE_SPECIFIER?: string;
      // '"$(BUILT_PRODUCTS_DIR)/rni.app/rni"'
      TEST_HOST?: any;
      DEVELOPMENT_TEAM?: string;
      CODE_SIGN_IDENTITY?: string;
      CODE_SIGN_STYLE?: string;
      // '"$(TEST_HOST)"'
      BUNDLE_LOADER?: string;
      GCC_PREPROCESSOR_DEFINITIONS?: Array<unknown>;
      INFOPLIST_FILE?: string;
      IPHONEOS_DEPLOYMENT_TARGET?: string;
      LD_RUNPATH_SEARCH_PATHS?: string;
      OTHER_LDFLAGS?: Array<unknown>;
      ASSETCATALOG_COMPILER_APPICON_NAME?: string;
      ASSETCATALOG_COMPILER_LAUNCHIMAGE_NAME?: string;
      CLANG_ANALYZER_NONNULL?: string;
      CLANG_WARN_DOCUMENTATION_COMMENTS?: string;
      CLANG_WARN_INFINITE_RECURSION?: string;
      CLANG_WARN_SUSPICIOUS_MOVE?: string;
      DEBUG_INFORMATION_FORMAT?: string;
      ENABLE_TESTABILITY?: string;
      GCC_NO_COMMON_BLOCKS?: string;
      // 'appletvos'
      SDKROOT?: string;
      TARGETED_DEVICE_FAMILY?: number | string;
      // '10.0'
      TVOS_DEPLOYMENT_TARGET?: string;
    };
    name: string;
  }

  type ProductType =
    | 'com.apple.product-type.application'
    | 'com.apple.product-type.app-extension'
    | 'com.apple.product-type.bundle'
    | 'com.apple.product-type.tool'
    | 'com.apple.product-type.library.dynamic'
    | 'com.apple.product-type.framework'
    | 'com.apple.product-type.library.static'
    | 'com.apple.product-type.bundle.unit-test'
    | 'com.apple.product-type.application.watchapp'
    | 'com.apple.product-type.application.watchapp2'
    | 'com.apple.product-type.watchkit-extension'
    | 'com.apple.product-type.watchkit2-extension';

  interface PBXGroup {
    isa: 'PBXGroup';
    children: Array<{
      value: UUID;
      comment?: string;
    }>;
    name: string;
    path?: string;
    sourceTree: '"<group>"' | unknown;
  }

  export class XcodeProject {

    /**
     * `.pbxproj` file path.
     */
    public filepath: string;

    // Ex: '$(TARGET_NAME)'
    public productName: string;

    public hash: {
      headComment: string;
      project: {
        archiveVersion: number;
        objectVersion: number;
        objects: {
          [T in XCObjectType]: Record<
            string,
            {
              isa: T;
              name: string;
              [key: string]: any;
            }
          >;
        };
        rootObject: string;
        rootObject_comment: string;
      };
    };
    constructor(pbxprojPath: string);

    // ------------------------------------------------------------------------
    //
    // `.pbxproj` related operation - starting & ending point.
    //
    // ------------------------------------------------------------------------

    /**
     * First step to be executed while working with `.pbxproj` file.
     */
    public parse(callback?: (err: Error | null, results?: string) => void): this;

    public parseSync(): void;

    /**
     * @returns Content of .pbxproj file.
     */
    public writeSync(options?: { omitEmptyValues?: boolean }): string;

    public allUuids(): UUID[];
    public generateUuid(): UUID;

    public addPluginFile(path: unknown, opt: unknown): unknown;
    public removePluginFile(path: unknown, opt: unknown): unknown;
    public addProductFile(targetPath: unknown, opt: unknown): unknown;
    public removeProductFile(path: unknown, opt: unknown): unknown;
    public addSourceFile(path: string, opt: unknown, group: string): unknown;
    public removeSourceFile(path: string, opt: unknown, group: string): unknown;
    public addHeaderFile(path: string, opt: unknown, group: string): unknown;
    public removeHeaderFile(path: string, opt: unknown, group: string): unknown;
    public addResourceFile(path: string, opt: unknown, group: string): unknown;
    public removeResourceFile(path: string, opt: unknown, group: string): unknown;
    public addFramework(fpath: unknown, opt: unknown): unknown;
    public removeFramework(fpath: unknown, opt: unknown): unknown;
    public addCopyfile(fpath: unknown, opt: unknown): unknown;
    public pbxCopyfilesBuildPhaseObj(target: unknown): unknown;
    public addToPbxCopyfilesBuildPhase(file: unknown): void;
    public removeCopyfile(fpath: unknown, opt: unknown): unknown;
    public removeFromPbxCopyfilesBuildPhase(file: unknown): void;
    public addStaticLibrary(path: unknown, opt: unknown): unknown;
    /**
     * Adds to `PBXBuildFile` section
     */
    public addToPbxBuildFileSection(file: PBXFile): void;
    public removeFromPbxBuildFileSection(file: unknown): void;
    public addPbxGroup(
      filePathsArray: string[],
      name: string,
      path: string,
      sourceTree?: string,
    ): { uuid: UUID; pbxGroup: PBXGroup };
    public removePbxGroup(groupName: unknown): void;
    public addToPbxProjectSection(target: unknown): void;
    public addToPbxNativeTargetSection(target: unknown): void;
    public addToPbxFileReferenceSection(file: any): void;
    public removeFromPbxFileReferenceSection(file: unknown): unknown;
    public addToXcVersionGroupSection(file: unknown): void;
    public addToPluginsPbxGroup(file: unknown): void;
    public removeFromPluginsPbxGroup(file: unknown): unknown;
    public addToResourcesPbxGroup(file: unknown): void;
    public removeFromResourcesPbxGroup(file: unknown): unknown;
    public addToFrameworksPbxGroup(file: unknown): void;
    public removeFromFrameworksPbxGroup(file: unknown): unknown;
    public addToPbxEmbedFrameworksBuildPhase(file: unknown): void;
    public removeFromPbxEmbedFrameworksBuildPhase(file: unknown): void;
    public addToProductsPbxGroup(file: unknown): void;
    public removeFromProductsPbxGroup(file: unknown): unknown;
    public addToPbxSourcesBuildPhase(file: unknown): void;
    public removeFromPbxSourcesBuildPhase(file: unknown): void;
    /**
     * Adds to PBXResourcesBuildPhase` section
     * @param resourcesBuildPhaseSectionKey Because there's might more than one `Resources` build phase we need to ensure file is placed under correct one.
     */
    public addToPbxResourcesBuildPhase(file: PBXFile): void;
    public removeFromPbxResourcesBuildPhase(file: unknown): void;
    public addToPbxFrameworksBuildPhase(file: unknown): void;
    public removeFromPbxFrameworksBuildPhase(file: unknown): void;
    public addXCConfigurationList(
      configurationObjectsArray: unknown,
      defaultConfigurationName: unknown,
      comment: unknown,
    ): {
      uuid: unknown;
      xcConfigurationList: {
        isa: string;
        buildConfigurations: Array<unknown>;
        defaultConfigurationIsVisible: number;
        defaultConfigurationName: unknown;
      };
    };
    public addTargetDependency(
      target: unknown,
      dependencyTargets: unknown,
    ): {
      uuid: unknown;
      target: unknown;
    };
    public addBuildPhase(
      filePathsArray: unknown,
      buildPhaseType: unknown,
      comment: unknown,
      target: unknown,
      optionsOrFolderType: unknown,
      subfolderPath: unknown,
    ): {
      uuid: unknown;
      buildPhase: {
        isa: unknown;
        buildActionMask: number;
        files: Array<unknown>;
        runOnlyForDeploymentPostprocessing: number;
      };
    };
    /**
     * Retrieves main part describing PBXProjects that are available in `.pbxproj` file.
     */
    public pbxProjectSection(): Record<UUID, PBXProject> & Record<UUIDComment, string>;
    public pbxBuildFileSection(): Record<UUID, PBXBuildFile> & Record<UUIDComment, string>;
    public pbxXCBuildConfigurationSection(): Record<UUID, XCBuildConfiguration> &
      Record<UUIDComment, string>;
    public pbxFileReferenceSection(): Record<UUID, PBXFile> & Record<UUIDComment, string>;
    public pbxNativeTargetSection(): Record<UUID, PBXNativeTarget> & Record<UUIDComment, string>;
    public xcVersionGroupSection(): unknown;
    public pbxXCConfigurationList(): Record<UUID, XCConfigurationList> & Record<UUIDComment, string>;
    public pbxGroupByName(name: string): PBXGroup | undefined;
    /**
     * @param targetName in most cases it's the name of the application
     */
    public pbxTargetByName(targetName: string): PBXNativeTarget | undefined;
    public findTargetKey(name: string): string;
    public pbxItemByComment(name: string, pbxSectionName: unknown): unknown;
    public pbxSourcesBuildPhaseObj(target: unknown): unknown;
    public pbxResourcesBuildPhaseObj(target: unknown): unknown;
    public pbxFrameworksBuildPhaseObj(target: unknown): unknown;
    public pbxEmbedFrameworksBuildPhaseObj(target: unknown): unknown;
    public buildPhase(group: unknown, target: unknown): string;
    public buildPhaseObject(name: string, group: unknown, target: unknown): unknown;
    public addBuildProperty(prop: unknown, value: unknown, build_name: unknown): void;
    public removeBuildProperty(prop: unknown, build_name: unknown): void;
    public updateBuildProperty(prop: string, value: unknown, build: string): void;
    public updateProductName(name: string): void;
    public removeFromFrameworkSearchPaths(file: unknown): void;
    public addToFrameworkSearchPaths(file: unknown): void;
    public removeFromLibrarySearchPaths(file: unknown): void;
    public addToLibrarySearchPaths(file: unknown): void;
    public removeFromHeaderSearchPaths(file: unknown): void;
    public addToHeaderSearchPaths(file: unknown): void;
    public addToOtherLinkerFlags(flag: unknown): void;
    public removeFromOtherLinkerFlags(flag: unknown): void;
    public addToBuildSettings(buildSetting: unknown, value: unknown): void;
    public removeFromBuildSettings(buildSetting: unknown): void;
    /**
     * Checks whether there is a file with given `filePath` in the project.
     */
    public hasFile(filePath: string): PBXFile | false;
    public addTarget(
      name: unknown,
      type: unknown,
      subfolder: unknown,
    ): {
      uuid: unknown;
      pbxNativeTarget: {
        isa: string;
        name: string;
        productName: string;
        productReference: unknown;
        productType: string;
        buildConfigurationList: unknown;
        buildPhases: Array<unknown>;
        buildRules: Array<unknown>;
        dependencies: Array<unknown>;
      };
    };
    /**
     * Get First PBXProject that can be found in `.pbxproj` file.
     */
    public getFirstProject(): { uuid: UUID; firstProject: PBXProject };
    public getFirstTarget(): {
      uuid: UUID;
      firstTarget: unknown;
    };
    /**
     * Retrieves PBXNativeTarget by the type
     */
    public getTarget(productType: ProductType): { uuid: UUID; target: PBXNativeTarget } | null;
    public addToPbxGroupType(file: unknown, groupKey: unknown, groupType: unknown): void;
    public addToPbxVariantGroup(file: unknown, groupKey: unknown): void;
    public addToPbxGroup(file: PBXFile, groupKey: UUID): void;
    public pbxCreateGroupWithType(name: unknown, pathName: unknown, groupType: unknown): unknown;
    public pbxCreateVariantGroup(name: unknown): unknown;
    public pbxCreateGroup(name: string, pathName: string): UUID;
    public removeFromPbxGroupAndType(file: unknown, groupKey: unknown, groupType: unknown): void;
    public removeFromPbxGroup(file: unknown, groupKey: unknown): void;
    public removeFromPbxVariantGroup(file: unknown, groupKey: unknown): void;
    public getPBXGroupByKeyAndType(key: unknown, groupType: unknown): unknown;
    /**
     * @param groupKey UUID.
     */
    public getPBXGroupByKey(groupKey: string): PBXGroup | undefined;
    public getPBXVariantGroupByKey(key: unknown): unknown;
    public findPBXGroupKeyAndType(criteria: unknown, groupType: unknown): string;
    /**
     * @param criteria Params that should be used to locate desired PBXGroup.
     */
    public findPBXGroupKey(criteria: { name?: string; path?: string }): UUID | undefined;
    public findPBXVariantGroupKey(criteria: unknown): string;
    public addLocalizationVariantGroup(
      name: unknown,
    ): {
      uuid: unknown;
      fileRef: unknown;
      basename: unknown;
    };
    public addKnownRegion(name: string): void;
    public removeKnownRegion(name: string): void;
    public hasKnownRegion(name: string): boolean;
    public getPBXObject(name: string): unknown;
    /**
     * - creates `PBXFile`
     * - adds to `PBXFileReference` section
     * - adds to `PBXGroup` or `PBXVariantGroup` if applicable
     * @returns `null` if file is already in `pbxproj`.
     */
    public addFile(
      path: string,
      group?: string,
      opt?: {
        plugin?: string;
        target?: string;
        variantGroup?: string;
        lastKnownFileType?: string;
        defaultEncoding?: 4;
        customFramework?: true;
        explicitFileType?: number;
        weak?: true;
        compilerFLags?: string;
        embed?: boolean;
        sign?: boolean;
      },
    ): PBXFile | null;
    public removeFile(path: unknown, group: unknown, opt: unknown): unknown;
    public getBuildProperty(prop: unknown, build: unknown): unknown;
    public getBuildConfigByName(name: unknown): object;
    public addDataModelDocument(filePath: unknown, group: unknown, opt: unknown): unknown;
    public addTargetAttribute(prop: unknown, value: unknown, target: unknown): void;
    public removeTargetAttribute(prop: unknown, target: unknown): void;
  }

  export function project(projectPath: string): XcodeProject;
}

declare module 'xcode/lib/pbxFile' {
  export default class PBXFile implements pbxFile {
    public basename: string;
    public lastKnownFileType?: string;
    public group?: string;
    public path?: string;
    public fileEncoding?: number;
    public defaultEncoding?: number;
    public sourceTree: string;
    public includeInIndex?: number;
    public explicitFileType?: unknown;
    public settings?: object;
    public uuid?: string;
    public fileRef: string;
    public target?: string;
    constructor(file: string);
  }
}
