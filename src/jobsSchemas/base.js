import Joi from 'joi';

import { PLATFORMS, TURTLE_VERSIONS } from 'turtle/constants';

export default Joi.object().keys({
  platform: Joi.string().valid(Object.values(PLATFORMS)),
  username: Joi.string(),
  experienceName: Joi.string(),
  id: Joi.string().uuid(),
  experience: Joi.object().keys({
    sdkVersion: Joi.string(),
  }),
  config: Joi.object()
    .keys({
      releaseChannel: Joi.string().regex(/[a-z\d][a-z\d._-]*/),
      turtleVersion: Joi.string().valid(Object.values(TURTLE_VERSIONS)),
    })
    .unknown(true),
  projectDir: Joi.string(),
});
