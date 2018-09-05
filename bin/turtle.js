#!/usr/bin/env node
'use strict';

require('source-map-support').install();
require('../build/bin/env').initOfflineEnv();
require('../build/bin/index').run('turtle');
