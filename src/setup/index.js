import { PLATFORMS } from 'turtle/constants';
import ios from 'turtle/setup/ios';
import android from 'turtle/setup/android';

export default {
  [PLATFORMS.IOS]: ios,
  [PLATFORMS.ANDROID]: android,
};
