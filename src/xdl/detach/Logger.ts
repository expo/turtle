import bunyan from '@expo/bunyan';
import isEmpty from 'lodash/isEmpty';
import isPlainObject from 'lodash/isPlainObject';
import { Readable } from 'stream';

export enum LogLevel {
  trace = 'trace',
  debug = 'debug',
  info = 'info',
  warn = 'warn',
  error = 'error',
  fatal = 'fatal',
}

type BunyanGetter = () => bunyan;

export class Logger {
  public loggerObj: bunyan;
  public loggerGetter?: BunyanGetter;
  public extraFields: any;

  constructor(bunyanGetter?: BunyanGetter, extraFields?: any) {
    this.loggerObj = bunyan.createLogger({ name: 'xdl-detach' });
    this.loggerGetter = bunyanGetter;
    this.extraFields = extraFields;
  }

  public configure(loggerObj: bunyan) {
    this.loggerObj = loggerObj;
  }

  public withFields(extraFields: any) {
    const getter = this.loggerGetter || (() => this.loggerObj);
    return new Logger(getter, { ...this.extraFields, ...extraFields });
  }

  public trace(...all: any[]) {
    this.logLine(LogLevel.trace, ...all);
  }
  public debug(...all: any[]) {
    this.logLine(LogLevel.debug, ...all);
  }
  public info(...all: any[]) {
    this.logLine(LogLevel.info, ...all);
  }
  public warn(...all: any[]) {
    this.logLine(LogLevel.warn, ...all);
  }
  public error(...all: any[]) {
    this.logLine(LogLevel.error, ...all);
  }
  public fatal(...all: any[]) {
    this.logLine(LogLevel.fatal, ...all);
  }

  public logLine(level: LogLevel, ...args: any[]) {
    const argsToLog = [...args];
    const extraFieldsFromArgsExist = isPlainObject(args[0]);
    const extraFieldsFromArgs = extraFieldsFromArgsExist ? args[0] : {};
    if (extraFieldsFromArgsExist) {
      argsToLog.shift();
    }
    const extraFields = { ...extraFieldsFromArgs, ...this.extraFields };
    if (!isEmpty(extraFields)) {
      argsToLog.unshift(extraFields);
    }

    if (this.loggerGetter) {
      const loggerObj = this.loggerGetter();
      // @ts-ignore: type mismatch
      loggerObj[level](...argsToLog);
    } else {
      // @ts-ignore: type mismatch
      this.loggerObj[level](...argsToLog);
    }
  }
}

const LoggerDetach = new Logger();
export default LoggerDetach;

export function pipeOutputToLogger(
  { stdout, stderr }: { stdout?: Readable | null; stderr?: Readable | null } = {
    stdout: null,
    stderr: null,
  },
  extraFields = {},
  {
    stdoutOnly = false,
    loggerLineTransformer,
  }: { stdoutOnly?: boolean; loggerLineTransformer?: (line: any) => any } = {},
) {
  if (stdout) {
    stdout.on('data', (chunk) =>
      logMultiline(
        chunk,
        { ...extraFields, source: 'stdout' },
        loggerLineTransformer,
      ),
    );
  }
  if (stderr) {
    const source = stdoutOnly ? 'stdout' : 'stderr';
    stderr.on('data', (chunk) =>
      logMultiline(chunk, { ...extraFields, source }, loggerLineTransformer),
    );
  }
}

function logMultiline(
  data: any,
  extraFields: any,
  loggerLineTransformer?: (line: any) => any,
) {
  if (!data) {
    return;
  }
  const lines = String(data).split('\n');
  lines.forEach((line) => {
    const lineToPrint = loggerLineTransformer
      ? loggerLineTransformer(line)
      : line;
    if (lineToPrint) {
      const args = [lineToPrint];
      if (!isEmpty(extraFields)) {
        args.unshift(extraFields);
      }
      LoggerDetach.info(...args);
    }
  });
}
