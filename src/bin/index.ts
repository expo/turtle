import { LoggerDetach, ModuleVersion } from 'xdl';
import program, { Command } from 'commander';
import _ from 'lodash';

import logger from 'turtle/logger';
import * as commands from 'turtle/bin/commands';

const { name, version } = require('../../package.json');

const ModuleVersionChecker = ModuleVersion.createModuleVersionChecker(name, version);

LoggerDetach.configure(logger);

Command.prototype.asyncAction = function asyncAction(asyncFn: (...asyncFnArgs: any[]) => void): Command {
  return this.action(async (...args) => {
    try {
      await checkForUpdateAsync();
    } catch (e) {}
    return await asyncFn(...args);
  });
}

export function run(programName: string) {
  runAsync(programName).catch(e => {
    logger.error('Uncaught Error', e);
    process.exit(1);
  });
}

async function runAsync(programName: string) {
  program.version(version);
  Object.values(commands).forEach(command => registerCommand(program, command));
  program.parse(process.argv);

  const subCommand = process.argv[2];
  if (subCommand) {
    const commands = program.commands.reduce((acc: Array<string>, command: any) => {
      acc.push(command['_name']);
      const alias = command['_alias'];
      if (alias) {
        acc.push(alias);
      }
      return acc;
    }, []);
    if (!_.includes(commands, subCommand)) {
      logger.error(
        `"${subCommand}" is not an ${programName} command. See "${programName} --help" for the full list of commands.`
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
Run \`npm install -g ${name}\` to get the latest version`
    );
  }
}
