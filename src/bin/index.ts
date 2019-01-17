import path from 'path';

import program, { Command } from 'commander';
import fs from 'fs-extra';
import { LoggerDetach, ModuleVersion } from 'xdl';

import * as commands from 'turtle/bin/commands';
import logger from 'turtle/logger';

const { name, version } = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf-8'));

const ModuleVersionChecker = ModuleVersion.createModuleVersionChecker(name, version);

LoggerDetach.configure(logger);

Command.prototype.asyncAction = function asyncAction(asyncFn: (...asyncFnArgs: any[]) => void): Command {
  return this.action(async (...args) => {
    try {
      await checkForUpdateAsync();
    } catch (e) {
      logger.warn('Failed to check for turtle-cli update.');
    }
    return await asyncFn(...args);
  });
};

export function run(programName: string) {
  runAsync(programName).catch((e) => {
    logger.error('Uncaught Error', e);
    process.exit(1);
  });
}

async function runAsync(programName: string) {
  program.version(version);
  Object.values(commands).forEach((command) => registerCommand(program, command));
  program.parse(process.argv);

  const subCommand = process.argv[2];
  if (subCommand) {
    const commandNames = program.commands.reduce((acc: string[], command: any) => {
      acc.push(command._name);
      const alias = command._alias;
      if (alias) {
        acc.push(alias);
      }
      return acc;
    }, []);
    if (!commandNames.includes(subCommand)) {
      logger.error(
        `"${subCommand}" is not an ${programName} command. See "${programName} --help" for the full list of commands.`,
      );
    }
  } else {
    program.help();
  }
}

const registerCommand = (prog: any, command: any) => command(prog);

async function checkForUpdateAsync() {
  const { updateIsAvailable, current, latest } = await ModuleVersionChecker.checkAsync();
  if (updateIsAvailable) {
    logger.warn(
      `There is a new version of ${name} available (${latest}).
You are currently using ${name} ${current}
Run \`npm install -g ${name}\` to get the latest version`,
    );
  }
}
