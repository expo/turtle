import Joi from 'joi';

import { IOS_BUILD_TYPES, PLATFORMS } from 'turtle/constants/index';
import baseJobSchema from 'turtle/jobsSchemas/base';

export default baseJobSchema.concat(
  Joi.object().keys({
    platform: Joi.string().valid(PLATFORMS.IOS),
    config: Joi.object().keys({
      buildType: Joi.string().default(IOS_BUILD_TYPES.ARCHIVE),
      bundleIdentifier: Joi.string().regex(/^[a-zA-Z][a-zA-Z0-9\-.]+$/),
    }),
    credentials: Joi.object()
      .keys({
        certP12: Joi.string().required(),
        certPassword: Joi.string().required(),
        teamId: Joi.string().required(),
        // it's not required for adhoc Expo Client builds
        provisioningProfile: Joi.string(),
        appleSession: Joi.string(),
        udids: Joi.array().items(Joi.string()),
      })
      .when('config.buildType', {
        is: IOS_BUILD_TYPES.SIMULATOR,
        then: Joi.optional(),
        otherwise: Joi.required(),
      }),
  }),
);
