import fs from 'fs-extra';
import path from 'path';

export async function loadAppJSON(projectDirArg: string, config: string | null) {
  let appJSONPath;
  if (config) {
    appJSONPath = resolveAbsoluteDir(config);
  } else {
    const projectDir = resolveAbsoluteDir(projectDirArg);
    appJSONPath = path.join(projectDir, 'app.json');
  }
  const appJSONExists = await fs.pathExists(appJSONPath);
  if (!appJSONExists) {
    throw new Error(`Couldn't find app.json.`);
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
