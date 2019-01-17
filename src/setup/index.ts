import { PLATFORMS } from 'turtle/constants';
import android from 'turtle/setup/android';
import ios from 'turtle/setup/ios';

export default {
  [PLATFORMS.IOS]: ios,
  [PLATFORMS.ANDROID]: android,
};
