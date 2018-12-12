import isSemver from 'is-semver';

import setupIos from 'turtle/bin/setup/ios';
import setupAndroid from 'turtle/bin/setup/android';
import { PLATFORMS } from 'turtle/constants';

export default async function setup(platform: string, sdkVersion?: string) {
  if (sdkVersion && !isSemver(sdkVersion)) {
    throw new Error('SDK version is not valid.');
  }

  if (platform === PLATFORMS.IOS) {
    return await setupIos(sdkVersion);
  } else if (platform === PLATFORMS.ANDROID) {
    return await setupAndroid(sdkVersion);
  } else {
    throw new Error('This should never happen :(');
  }
}
