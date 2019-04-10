import util from 'util';
import _which from 'which';

import logger from 'turtle/logger';

const which = util.promisify(_which);

export interface IToolDefinition {
  command: string;
  missingDescription: string;
  testFn?: () => Promise<boolean>;
}

export async function ensureToolsAreInstalled(tools: IToolDefinition[]) {
  let isAnyToolMissing = false;
  for (const { command, missingDescription, testFn } of tools) {
    try {
      if (testFn) {
        if (!await testFn()) {
          throw new Error('Required tool doesn\'t exist');
        }
      } else {
        await which(command);
      }
    } catch (err) {
      const l = logger.child({ buildPhase: 'setting up environment' });
      isAnyToolMissing = true;
      if (!testFn) {
        l.error({ err }, `${command} is missing in your $PATH`);
      }
      l.error({ err }, missingDescription);
    }
  }
  if (isAnyToolMissing) {
    throw new Error('Tools required to perform standalone app build are missing. Please install them.');
  }
}
