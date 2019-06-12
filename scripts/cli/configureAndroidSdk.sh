#!/usr/bin/env bash

SDKMANAGER=$ANDROID_HOME/tools/bin/sdkmanager

yes | $SDKMANAGER --licenses > /dev/null
yes | $SDKMANAGER "platforms;android-28" | grep -v '='; [[ ${PIPESTATUS[1]} = 0 ]]
yes | $SDKMANAGER "platform-tools" | grep -v '='; [[ ${PIPESTATUS[1]} = 0 ]]
yes | $SDKMANAGER "build-tools;28.0.3" | grep -v '='; [[ ${PIPESTATUS[1]} = 0 ]]
yes | $SDKMANAGER \
  "extras;android;m2repository" \
  "extras;google;m2repository" \
  "extras;google;google_play_services" | grep -v '='; [[ ${PIPESTATUS[1]} = 0 ]]
