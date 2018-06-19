export interface IContext {
  appDir: string;
  appUUID: string;
  archiveDir: string;
  baseArchiveDir: string;
  buildDir: string;
  fakeUploadBuildPath?: string;
  outputPath: string;
  provisioningProfilePath: string;
  provisioningProfileDir: string;
  s3FileKey?: string;
  tempCertPath: string;
  uploadPath: string;
}

export interface IUploadCtx {
  fakeUploadBuildPath?: string;
  s3FileKey?: string;
  uploadPath: string;
}
