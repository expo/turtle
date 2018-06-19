FROM openjdk:8u141

ENV DEBIAN_FRONTEND noninteractive

# https://github.com/yarnpkg/yarn/issues/2821
RUN apt-get update && apt-get install apt-transport-https
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

# Install dependencies
# TODO: find out if yarn is actually necessary
RUN dpkg --add-architecture i386 && \
  apt-get update && \
  apt remove cmdtest && \
  apt-get install -yq \
  ant\
  build-essential\
  bzip2:i386\
  file\
  lib32ncurses5\
  lib32z1\
  libc6:i386\
  libncurses5:i386\
  libstdc++6:i386\
  unzip\
  yarn\
  zlib1g:i386\
  --no-install-recommends && \
  apt-get clean

ENV NPM_CONFIG_LOGLEVEL warn
ENV NODE_VERSION 8.9.0

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs

# Download and untar SDK
ENV ANDROID_HOME /usr/local/android-sdk-linux
ENV ANDROID_SDK /usr/local/android-sdk-linux
ENV ANDROID_SDK_URL https://dl.google.com/android/repository/sdk-tools-linux-3859397.zip
RUN mkdir -p ${ANDROID_HOME} && \
  curl -L "${ANDROID_SDK_URL}" > ${ANDROID_HOME}/sdk.zip && \
  cd ${ANDROID_HOME} && \
  unzip -qq sdk.zip && \
  rm sdk.zip && \
  # prevents warnings about missing repo config
  mkdir -p ${HOME}/.android && \
  touch ${HOME}/.android/repositories.cfg

ENV PATH ${ANDROID_HOME}/platform-tools:${PATH}
ENV PATH ${ANDROID_HOME}/tools:${PATH}
ENV PATH ${ANDROID_HOME}/tools/bin:${PATH}
ENV PATH ${ANDROID_HOME}/build-tools/25.0.0/:${PATH}

RUN yes | sdkmanager --licenses > /dev/null

# Install Android SDK components
RUN sdkmanager \
  "platform-tools" \
  "platforms;android-23" \
  "build-tools;25.0.0" \
  "extras;android;m2repository" \
  "extras;google;m2repository"

# Install Android NDK
ENV ANDROID_NDK_VERSION android-ndk-r10e
ENV ANDROID_NDK_FILE ${ANDROID_NDK_VERSION}-linux-x86_64.bin
ENV ANDROID_NDK_URL https://dl.google.com/android/ndk/${ANDROID_NDK_FILE}
ENV ANDROID_NDK /opt/${ANDROID_NDK_VERSION}
ENV PATH $ANDROID_NDK:$PATH

# i have no clue why some of this is here, but it's working elsewhere
# it appears to install the NDK version expo needs, so that's cool
RUN mkdir /ndk_setup && cd /ndk_setup && \
  curl -L ${ANDROID_NDK_URL} > ${ANDROID_NDK_FILE} && \
  chmod +x ${ANDROID_NDK_FILE} && \
  sync && \
  ./${ANDROID_NDK_FILE} && \
  mv ./${ANDROID_NDK_VERSION} ${ANDROID_NDK} && \
  cp -R \
  ${ANDROID_NDK}/toolchains/arm-linux-androideabi-4.8/prebuilt/linux-x86_64 \
  ${ANDROID_NDK}/toolchains/arm-linux-androideabi-4.8/prebuilt/linux-x86 && \
  cp -R \
  ${ANDROID_NDK}/toolchains/x86-4.8/prebuilt/linux-x86_64 \
  ${ANDROID_NDK}/toolchains/x86-4.8/prebuilt/linux-x86 && \
  cd && rm -rf /ndk_setup

# Support Gradle
ENV TERM dumb

# Install gradle
RUN wget https://services.gradle.org/distributions/gradle-2.13-all.zip
RUN unzip -qq gradle-2.13-all.zip
RUN mv gradle-2.13 /usr/local
RUN rm gradle-2.13-all.zip
ENV GRADLE_HOME /usr/local/gradle-2.13
ENV PATH ${GRADLE_HOME}/bin:$PATH

ADD . /app

WORKDIR /app
RUN yarn build:production

CMD ["yarn", "start:server"]
