"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xdl_1 = require("@expo/xdl");
const ErrorWithProgramHelp_1 = require("../commands/ErrorWithProgramHelp");
async function ensureUserLoggedIn(userData) {
    const currentUser = await xdl_1.UserManager.getCurrentUserAsync();
    if (currentUser) {
        return currentUser;
    }
    else if (!userData.username || !userData.password) {
        throw new ErrorWithProgramHelp_1.ErrorWithProgramHelp('Please provide username and password');
    }
    else {
        try {
            return await xdl_1.UserManager.loginAsync('user-pass', userData);
        }
        catch (err) {
            throw new Error('Failed to log in with provided username and password');
        }
    }
}
exports.ensureUserLoggedIn = ensureUserLoggedIn;
//# sourceMappingURL=user.js.map