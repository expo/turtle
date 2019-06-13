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

ADD scripts/android/configureAndroidSdk.sh /tmp/configureAndroidSdk.sh
RUN /tmp/configureAndroidSdk.sh --install-all-platforms

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
RUN wget https://services.gradle.org/distributions/gradle-4.4-all.zip
RUN unzip -qq gradle-4.4-all.zip
RUN mv gradle-4.4 /usr/local
RUN rm gradle-4.4-all.zip
ENV GRADLE_HOME /usr/local/gradle-4.4
ENV PATH ${GRADLE_HOME}/bin:$PATH

ADD . /app/turtle

RUN mv /app/turtle/workingdir /app && \
    for SDK_VERSION in `ls /app/workingdir/android/`; do \
      echo "preparing $SDK_VERSION shell app" && \
      cd /app/workingdir/android/$SDK_VERSION && \
      if [ -f universe-package.json ]; then \
      mv package.json exponent-package.json && \
      mv universe-package.json package.json && \
      yarn install && \
      mv package.json universe-package.json && \
      mv exponent-package.json package.json; \
      else \
      yarn install; \
      fi \
    ; done && \
    mv /app/workingdir /app/turtle

ENV NODE_ENV "production"
ENV TURTLE_WORKING_DIR_PATH /app/turtle/workingdir/

WORKDIR /app/turtle

ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf

CMD ["/usr/bin/supervisord"]
