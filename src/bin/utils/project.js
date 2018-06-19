import path from 'path';

import fs from 'fs-extra';

export async function loadAppJSON(projectDirArg) {
  const projectDir = resolveProjectDir(projectDirArg);
  const appJSONPath = path.join(projectDir, 'app.json');
  const appJSONExists = await fs.pathExists(appJSONPath);
  if (!appJSONExists) {
    throw new Error(`Couldn't find app.json in ${projectDir} directory.`);
  } else {
    return require(appJSONPath);
  }
}

export const resolveProjectDir = projectDirArg => {
  if (projectDirArg && path.isAbsolute(projectDirArg)) {
    return projectDirArg;
  } else {
    const cwd = process.env.INIT_CWD || process.cwd();
    return projectDirArg ? path.join(cwd, projectDirArg) : cwd;
  }
};
