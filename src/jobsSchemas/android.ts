import Joi from 'joi';

import { PLATFORMS } from 'turtle/constants';
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
  })
);
