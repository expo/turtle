"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = (varName, defaultValue) => {
    const envVar = process.env[varName];
    if (!envVar) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        else if (isOffline()) {
            // allow for null values in offline mode
            return null;
        }
        else {
            throw new Error(`environment variable ${varName} isn't specified`);
        }
    }
    else {
        return envVar;
    }
};
exports.envOptional = (varName) => exports.env(varName, null);
exports.envTransform = (varName, defaultValue, fn) => fn(exports.env(varName, defaultValue));
exports.envNum = (varName, defaultValue) => parseInt(exports.env(varName, defaultValue), 10);
exports.envBoolean = (varName, defaultValue) => {
    let defaultString;
    if (defaultValue === true) {
        defaultString = 'true';
    }
    else if (defaultValue === false) {
        defaultString = 'false';
    }
    else {
        defaultString = defaultValue;
    }
    return exports.env(varName, defaultString) === 'true';
};
const isOffline = () => process.env.TURTLE_MODE === 'offline';
//# sourceMappingURL=env.js.map