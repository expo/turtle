#!/usr/bin/env node
'use strict';

const subcommand = process.argv[2];
if (subcommand) {
  const [, platform] = subcommand.split(':');
  if (platform === 'ios' || platform === 'android') {
    // so that logs have correct platform set
    process.env.PLATFORM = platform;
  }
}

require('source-map-support').install();
require('../build/bin/env').initOfflineEnv();
require('../build/bin/index').run('turtle');
