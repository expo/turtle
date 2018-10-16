import isSemver from 'is-semver';

import setupIos from 'turtle/bin/setup/ios';
import setupAndroid from 'turtle/bin/setup/android';

export default async function setup(platform: string, sdkVersion?: string) {
  if (sdkVersion && !isSemver(sdkVersion)) {
    throw new Error('SDK version is not valid.');
  }

  if (platform === 'ios') {
    return await setupIos(sdkVersion);
  } else if (platform === 'android') {
    return await setupAndroid(sdkVersion);
  } else {
    throw new Error('This should never happen :(');
  }
}
