import { URL } from 'url';

import request from 'request-promise';

import config from 'turtle/config';
import { saveUpdateFailure } from 'turtle/updatesManager';

async function sendBuildStatusUpdate(buildId: string, updateParams: object) {
  const { href } = new URL(`/--/api/v2/turtle-legacy-builds/${buildId}`, resolveWWWEndpoint());
  try {
    await request({
      method: 'PUT',
      uri: href,
      headers: {
        'secret-token': config.www.secretToken,
      },
      body: updateParams,
      json: true,
    });
  } catch (err) {
    await saveUpdateFailure(buildId, 'build', updateParams);
  }
}

async function sendCredentialsUpdate(buildId: string, platform: 'android' | 'ios', updateParams: object) {
  const { href } = new URL(`/--/api/v2/turtle-legacy-builds/${buildId}/credentials`, resolveWWWEndpoint());
  try {
    await request({
      method: 'PUT',
      uri: href,
      headers: {
        'secret-token': config.www.secretToken,
      },
      body: {
        platform,
        ...updateParams,
      },
      json: true,
    });
  } catch (err) {
    await saveUpdateFailure(buildId, 'credentials', updateParams);
  }
}

function resolveWWWEndpoint() {
  const currentEnv = config.deploymentEnv;
  if (currentEnv === 'production') {
    return 'https://exp.host';
  } else if (currentEnv === 'staging') {
    return 'https://staging.exp.host';
  } else {
    return 'http://127.0.0.1:3000';
  }
}

export { sendBuildStatusUpdate, sendCredentialsUpdate };
