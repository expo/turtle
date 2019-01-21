#!/bin/bash

SDKMANAGER=$ANDROID_HOME/tools/bin/sdkmanager

yes | $SDKMANAGER --licenses > /dev/null
yes | $SDKMANAGER "platforms;android-28"
yes | $SDKMANAGER "platform-tools"
yes | $SDKMANAGER "build-tools;28.0.3"
yes | $SDKMANAGER \
  "extras;android;m2repository" \
  "extras;google;m2repository" \
  "extras;google;google_play_services"
