import path from 'path';

import { getConfig as getProjectConfig, setCustomConfigPath } from '@expo/config';
import fs from 'fs-extra';

export async function getConfig(projectDir: string, config: string | null) {
  projectDir = resolveAbsoluteDir(projectDir);
  if (config) {
    const pathToConfig = path.resolve(process.cwd(), config);
    if (!await fs.pathExists(pathToConfig)) {
      throw new Error(`File at provided config path does not exist: ${pathToConfig}`);
    }
    setCustomConfigPath(projectDir, pathToConfig);
  }
  return await getProjectConfig(projectDir, {});
}

export const resolveAbsoluteDir = (dir: string) => {
  if (dir && path.isAbsolute(dir)) {
    return dir;
  } else {
    const cwd = process.env.INIT_CWD || process.cwd();
    return dir ? path.join(cwd, dir) : cwd;
  }
};
