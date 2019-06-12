
import { PLATFORMS } from 'turtle/constants';
import logger from 'turtle/logger';
import {
  createConfigurationsKey,
  createDefaultConfigurationKey,
  HIGH_CONFIGURATION,
  HIGH_ONLY_CONFIGURATION,
} from 'turtle/utils/priorities';
import { connect, RedisClient } from 'turtle/utils/redis';

const TIMEOUT = 3000;

// Turtle before doing anything (and after every build) checks for the first config
// (an element in config table with key=i) that is not taken (config.i is null/outdated)
// or is taken by this process itself.
// If Turtle dies unexpectedly the configuration will become free after TTL expires,
// so the state (number of HP/NP turtles) should come back to normal soon.

// For example, if a configuration table looks like this:
// [ HIGH_CONFIGURATION, NORMAL_CONFIGURATION, HIGH_CONFIGURATION ]
// If there is one turtle it runs with High Priority first.
// If there are two turtles, one runs with High Priority first, the second one with Normal Priority first.
// If the first dies, and the third is started in his place, it gets 3rd config (again HP-first),
// but after some time, because of TTL for config reservations,
// they should come back to using configurations no. 1 and 2.
// If there are no more available configurations from the table, the default configuration is used.

const AVAILABLE_CONFIGURATIONS_IOS = [
  HIGH_CONFIGURATION,
  HIGH_CONFIGURATION,
  HIGH_ONLY_CONFIGURATION,
  HIGH_ONLY_CONFIGURATION,
  HIGH_ONLY_CONFIGURATION,
  // there are 5 iOS builders at the moment
  HIGH_CONFIGURATION,
  HIGH_CONFIGURATION,
  HIGH_CONFIGURATION,
];

const AVAILABLE_CONFIGURATIONS_ANDROID = [
  HIGH_CONFIGURATION,
  HIGH_CONFIGURATION,
  HIGH_CONFIGURATION,
  HIGH_CONFIGURATION,
  HIGH_CONFIGURATION,
  HIGH_CONFIGURATION,
  HIGH_CONFIGURATION,
  HIGH_CONFIGURATION,
  HIGH_CONFIGURATION,
  HIGH_CONFIGURATION,
  HIGH_CONFIGURATION,
  HIGH_CONFIGURATION,
  HIGH_CONFIGURATION,
  HIGH_CONFIGURATION,
  HIGH_CONFIGURATION,
  // there are 15 Android builders at the moment
  HIGH_CONFIGURATION,
  HIGH_CONFIGURATION,
  HIGH_CONFIGURATION,
];

const DEFAULT_CONFIGURATION = HIGH_CONFIGURATION;

async function run() {
  const redis = await connect(TIMEOUT, RedisClient.Configuration);

  await redis.set(createConfigurationsKey(PLATFORMS.IOS), JSON.stringify(AVAILABLE_CONFIGURATIONS_IOS));
  await redis.set(createConfigurationsKey(PLATFORMS.ANDROID), JSON.stringify(AVAILABLE_CONFIGURATIONS_ANDROID));
  await redis.set(createDefaultConfigurationKey(PLATFORMS.IOS), JSON.stringify(DEFAULT_CONFIGURATION));
  await redis.set(createDefaultConfigurationKey(PLATFORMS.ANDROID), JSON.stringify(DEFAULT_CONFIGURATION));

  redis.disconnect();
}

if (require.main === module) {
  run()
    .then(() => logger.info('All done'))
    .catch((err) => logger.error('Error:', err));
}
