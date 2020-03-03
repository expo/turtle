#!/usr/bin/env node
'use strict';

const subcommand = process.argv[2];
if (subcommand) {
  let platform;
  if (subcommand.length === 2) {
    const letter = subcommand[1];
    if (letter === 'a') {
      platform = 'android';
    } else if (letter === 'i') {
      platform = 'ios';
    }
  } else {
    const [, maybePlatform] = subcommand.split(':');
    platform = maybePlatform;
  }
  if (platform === 'ios' || platform === 'android') {
    // so that logs have correct platform set
    process.env.PLATFORM = platform;
  }
}

require('source-map-support').install();
require('../build/bin/env').initOfflineEnv();
require('../build/bin/index').run('turtle');
