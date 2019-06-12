#!/usr/bin/env bash

SDKMANAGER=$ANDROID_HOME/tools/bin/sdkmanager

yes | $SDKMANAGER --licenses > /dev/null
if [[ "$1" = "--install-all-platforms" ]]; then
  yes | $SDKMANAGER \
    "platforms;android-23" \
    "platforms;android-24" \
    "platforms;android-25" \
    "platforms;android-26" \
    "platforms;android-27" | grep -v '='; [[ ${PIPESTATUS[1]} = 0 ]]
fi
yes | $SDKMANAGER "platforms;android-28" | grep -v '='; [[ ${PIPESTATUS[1]} = 0 ]]
yes | $SDKMANAGER "platform-tools" | grep -v '='; [[ ${PIPESTATUS[1]} = 0 ]]
yes | $SDKMANAGER "build-tools;28.0.3" | grep -v '='; [[ ${PIPESTATUS[1]} = 0 ]]
yes | $SDKMANAGER \
  "extras;android;m2repository" \
  "extras;google;m2repository" \
  "extras;google;google_play_services" | grep -v '='; [[ ${PIPESTATUS[1]} = 0 ]]
