import { LoggerDetach } from 'xdl';
import program from 'commander';
import _ from 'lodash';

import logger from 'turtle/logger';
import * as commands from 'turtle/bin/commands';

const { version } = require('../../package.json');

LoggerDetach.configure(logger);

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
