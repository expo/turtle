import config from 'turtle/config';

let shouldExit = false;
let currentJobId: string | null = null;

export const setShouldExit = () => {
  shouldExit = true;
};

export const checkShouldExit = () => {
  return shouldExit;
};

export const getCurrentJobId = () => {
  return currentJobId;
};

export const setCurrentJobId = (id: string | null) => {
  currentJobId = id;
};

export const isOffline = () => config.builder.mode === 'offline';
