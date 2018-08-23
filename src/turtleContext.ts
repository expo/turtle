import config from 'turtle/config';

let shouldExit = false;
let _currentJobId: string | null = null;

export const setShouldExit = () => {
  shouldExit = true;
};

export const checkShouldExit = () => {
  return shouldExit;
};

export const getCurrentJobId = () => {
  return _currentJobId;
};

export const setCurrentJobId = (id: string | null) => {
  _currentJobId = id;
};

export const isOffline = () => config.builder.mode === 'offline';
