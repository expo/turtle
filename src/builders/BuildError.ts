class BuildError extends Error {
  public reason: BuildErrorReason;

  constructor(reason: BuildErrorReason, message: string) {
    super(message);
    this.name = 'BuildError';
    this.reason = reason;
  }
}

enum BuildErrorReason {
  SESSION_EXPIRED = 'session-expired',
  PROVISIONING_PROFILE_MISSING = 'provisioning-profile-missing',
}

export default BuildError;
export { BuildErrorReason };
