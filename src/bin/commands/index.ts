import builders from 'turtle/bin/commands/build';
import setup from 'turtle/bin/commands/setup';

export default {
  setupIOS: setup.ios,
  setupAndroid: setup.android,
  buildIOS: builders.ios,
  buildAndroid: builders.android,
};
