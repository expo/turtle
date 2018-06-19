import { User as UserManager } from 'xdl';

import { ErrorWithProgramHelp } from 'turtle/bin/commands/errors';

export async function ensureUserLoggedIn(userData) {
  const currentUser = await UserManager.getCurrentUserAsync();
  if (currentUser) {
    return currentUser;
  } else if (!userData.username || !userData.password) {
    throw new ErrorWithProgramHelp('Please provide username and password');
  } else {
    try {
      return await UserManager.loginAsync('user-pass', userData);
    } catch (err) {
      throw new Error('Failed to log in with provided username and password');
    }
  }
}
