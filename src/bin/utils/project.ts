import path from 'path';
import fs from 'fs-extra';

export async function loadAppJSON(projectDirArg: string) {
  const projectDir = resolveAbsoluteDir(projectDirArg);
  const appJSONPath = path.join(projectDir, 'app.json');
  const appJSONExists = await fs.pathExists(appJSONPath);
  if (!appJSONExists) {
    throw new Error(`Couldn't find app.json in ${projectDir} directory.`);
  } else {
    return require(appJSONPath);
  }
}

export const resolveAbsoluteDir = (dir: string) => {
  if (dir && path.isAbsolute(dir)) {
    return dir;
  } else {
    const cwd = process.env.INIT_CWD || process.cwd();
    return dir ? path.join(cwd, dir) : cwd;
  }
};
