#!/bin/bash

yes | $ANDROID_HOME/tools/bin/sdkmanager --licenses > /dev/null
$ANDROID_HOME/tools/bin/sdkmanager \
  "platform-tools" \
  "platforms;android-23" \
  "build-tools;25.0.0" \
  "extras;android;m2repository" \
  "extras;google;m2repository"
