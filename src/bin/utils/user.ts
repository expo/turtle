import { UserManager } from '@expo/xdl';

import { ErrorWithProgramHelp } from 'turtle/bin/commands/ErrorWithProgramHelp';

interface IUserData {
  username?: string;
  password?: string;
}

export async function ensureUserLoggedIn(userData: IUserData) {
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
