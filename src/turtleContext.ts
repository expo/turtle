import fs from 'fs-extra';
import path from 'path';
import config from 'turtle/config';

const { version: turtleVersion } = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));
export { turtleVersion };

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
