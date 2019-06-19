import Joi from 'joi';

import { ANDROID_BUILD_MODES, PLATFORMS } from 'turtle/constants';
import baseJobSchema from 'turtle/jobsSchemas/base';

export default baseJobSchema.concat(
  Joi.object().keys({
    platform: Joi.string().valid(PLATFORMS.ANDROID),
    credentials: Joi.object().keys({
      keystorePassword: Joi.string(),
      keyPassword: Joi.string(),
      keystoreAlias: Joi.string(),
      keystore: Joi.string(),
    }),
    config: Joi.object().keys({
      buildType: Joi.string().valid(Object.values(ANDROID_BUILD_MODES)).default(ANDROID_BUILD_MODES.RELEASE),
    }),
  }),
);
