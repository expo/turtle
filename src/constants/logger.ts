interface ILevelsMapping {
  [key: number]: string;
}

export const LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
export const LEVELS_MAPPING: ILevelsMapping = {
  10: 'TRACE',
  20: 'DEBUG',
  30: 'INFO',
  40: 'WARN',
  50: 'ERROR',
  60: 'FALAL',
};
