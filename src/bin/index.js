import { LoggerDetach } from 'xdl';
import program from 'commander';

import { version } from 'ROOT/package.json';
import * as commands from 'turtle/bin/commands';
import logger from 'turtle/logger';

LoggerDetach.configure(logger);

export function run(programName) {
  runAsync(programName).catch(e => {
    console.error('Uncaught Error', e);
    process.exit(1);
  });
}

async function runAsync(programName) {
  program.name = programName;
  program
    .version(version)
    .option('-u --username <username>', 'username (you can also set EXPO_USERNAME env variable)')
    .option('-p --password <password>', 'password (you can also set EXPO_PASSWORD env variable)');
  Object.values(commands).forEach(command => registerCommand(program, command));
  program.parse(process.argv);
}

const registerCommand = (program, command) => command(program);
