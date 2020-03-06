# If you ever need to rebuild this, run:
# yarn docker:build-and-push:android-base-image NEW_IMAGE_SEMVER
FROM openjdk:8u141

ENV DEBIAN_FRONTEND noninteractive

# https://github.com/yarnpkg/yarn/issues/2821
RUN apt-get update && apt-get install apt-transport-https
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

# Install dependencies
RUN dpkg --add-architecture i386 && \
  apt-get update && \
  apt-get install -yq \
  ant\
  build-essential\
  bzip2:i386\
  file\
  jq\
  lib32ncurses5\
  lib32z1\
  libc6:i386\
  libncurses5:i386\
  libstdc++6:i386\
  rsync\
  unzip\
  yarn\
  zlib1g:i386\
  supervisor\
  --no-install-recommends && \
  apt-get clean

ENV NPM_CONFIG_LOGLEVEL warn
ENV NODE_VERSION 8.12.0

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs

# Download and untar SDK
ENV ANDROID_HOME /usr/local/android-sdk-linux
ENV ANDROID_SDK /usr/local/android-sdk-linux
ENV ANDROID_SDK_URL https://dl.google.com/android/repository/sdk-tools-linux-4333796.zip
RUN mkdir -p ${ANDROID_HOME} && \
  curl -L "${ANDROID_SDK_URL}" > ${ANDROID_HOME}/sdk.zip && \
  cd ${ANDROID_HOME} && \
  unzip -qq sdk.zip && \
  rm sdk.zip && \
  mkdir -p ${HOME}/.android && \
  touch ${HOME}/.android/repositories.cfg

ENV PATH ${ANDROID_HOME}/platform-tools:${PATH}
ENV PATH ${ANDROID_HOME}/tools:${PATH}
ENV PATH ${ANDROID_HOME}/tools/bin:${PATH}
ENV PATH ${ANDROID_HOME}/build-tools/28.0.3/:${PATH}

ADD configureAndroidSdk.sh /tmp/configureAndroidSdk.sh
RUN /tmp/configureAndroidSdk.sh --install-all-platforms

# Support Gradle
ENV TERM dumb

# Install gradle
RUN wget https://services.gradle.org/distributions/gradle-4.4-all.zip
RUN unzip -qq gradle-4.4-all.zip
RUN mv gradle-4.4 /usr/local
RUN rm gradle-4.4-all.zip
ENV GRADLE_HOME /usr/local/gradle-4.4
ENV PATH ${GRADLE_HOME}/bin:$PATH
