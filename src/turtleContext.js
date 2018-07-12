import config from 'turtle/config';

let shouldExit = false;
let _currentJobId = null;

export const setShouldExit = () => {
  shouldExit = true;
};

export const checkShouldExit = () => {
  return shouldExit;
};

export const getCurrentJobId = () => {
  return _currentJobId;
};

export const setCurrentJobId = id => {
  _currentJobId = id;
};

export const isOffline = () => config.builder.mode === 'offline';
