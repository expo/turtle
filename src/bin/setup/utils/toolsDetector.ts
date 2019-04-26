import util from 'util';
import _which from 'which';

import logger from 'turtle/logger';

const which = util.promisify(_which);
const l = logger.child({ buildPhase: 'setting up environment' });

export interface IToolDefinition {
  command: string;
  missingDescription: string;
  testFn?: () => Promise<boolean>;
  versionCheckFn?: () => void;
}

export async function ensureToolsAreInstalled(tools: IToolDefinition[]) {
  let isAnyToolMissing = false;
  for (const { command, missingDescription, testFn, versionCheckFn } of tools) {
    try {
      if (testFn) {
        if (!await testFn()) {
          throw new Error('Required tool doesn\'t exist');
        }
      } else {
        await which(command);
      }
    } catch (err) {
      isAnyToolMissing = true;
      if (!testFn) {
        l.error({ err }, `${command} is missing in your $PATH`);
      }
      l.error({ err }, missingDescription);
    }
    if (versionCheckFn) {
      try {
        await versionCheckFn();
      } catch (err) {
        isAnyToolMissing = true;
        l.error({ err }, `wrong version of ${command} installed`);
      }
    }
  }
  if (isAnyToolMissing) {
    throw new Error('Tools required to perform standalone app build are missing. Please install them.');
  }
}
