import Joi from 'joi';

import { PLATFORMS } from 'turtle/constants';

export default Joi.object().keys({
  platform: Joi.string().valid(Object.values(PLATFORMS)),
  experienceName: Joi.string(),
  id: Joi.string().uuid(),
  manifest: Joi.object().unknown(true),
  config: Joi.object()
    .keys({
      releaseChannel: Joi.string().regex(/[a-z\d][a-z\d._-]*/),
    })
    .unknown(true),
  projectDir: Joi.string(),
  fakeUploadDir: Joi.string(),
  fakeUploadBuildPath: Joi.string(),
  sdkVersion: Joi.string(),
  messageCreatedTimestamp: Joi.number(),
});
