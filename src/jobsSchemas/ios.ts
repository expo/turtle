import Joi from 'joi';

import { IOS, PLATFORMS } from 'turtle/constants/index';
import baseJobSchema from 'turtle/jobsSchemas/base';

export default baseJobSchema.concat(
  Joi.object().keys({
    platform: Joi.string().valid(PLATFORMS.IOS),
    config: Joi.object().keys({
      buildType: Joi.string().default(IOS.BUILD_TYPES.ARCHIVE),
      bundleIdentifier: Joi.string().regex(/^[a-zA-Z][a-zA-Z0-9\-.]+$/),
    }),
    credentials: Joi.object()
      .keys({
        certP12: Joi.string(),
        certPassword: Joi.string(),
        teamId: Joi.string(),
        provisioningProfile: Joi.string(),
        password: Joi.string(),
      })
      .when('config.buildType', {
        is: IOS.BUILD_TYPES.SIMULATOR,
        then: Joi.optional(),
        otherwise: Joi.required(),
      }),
  })
);
