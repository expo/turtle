"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BuildError extends Error {
    constructor(reason, message) {
        super(message);
        this.name = 'BuildError';
        this.reason = reason;
    }
}
var BuildErrorReason;
(function (BuildErrorReason) {
    BuildErrorReason["SESSION_EXPIRED"] = "session-expired";
    BuildErrorReason["PROVISIONING_PROFILE_MISSING"] = "provisioning-profile-missing";
})(BuildErrorReason || (BuildErrorReason = {}));
exports.BuildErrorReason = BuildErrorReason;
exports.default = BuildError;
//# sourceMappingURL=BuildError.js.map