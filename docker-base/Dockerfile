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
ENV NODE_VERSION 12.16.1

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

# Install gradle 5.6.3
RUN wget https://services.gradle.org/distributions/gradle-5.6.3-all.zip
RUN unzip -qq gradle-5.6.3-all.zip
RUN cp -r gradle-5.6.3 /usr/local

RUN mkdir -p /root/.gradle/wrapper/dists/gradle-5.6.3-all/7wpcz6s7ut7bllr9k6e1hazxc
RUN mv gradle-5.6.3-all.zip /root/.gradle/wrapper/dists/gradle-5.6.3-all/7wpcz6s7ut7bllr9k6e1hazxc
RUN mv gradle-5.6.3 /root/.gradle/wrapper/dists/gradle-5.6.3-all/7wpcz6s7ut7bllr9k6e1hazxc
RUN touch /root/.gradle/wrapper/dists/gradle-5.6.3-all/7wpcz6s7ut7bllr9k6e1hazxc/gradle-5.6.3-all.zip.ok
RUN touch /root/.gradle/wrapper/dists/gradle-5.6.3-all/7wpcz6s7ut7bllr9k6e1hazxc/gradle-5.6.3-all.zip.lck
RUN chmod 755 /root/.gradle/wrapper/dists/gradle-5.6.3-all/7wpcz6s7ut7bllr9k6e1hazxc/gradle-5.6.3/bin/gradle

ENV GRADLE_HOME /usr/local/gradle-5.6.3
ENV PATH ${GRADLE_HOME}/bin:$PATH

# Install gradle 4.10.2
RUN wget https://services.gradle.org/distributions/gradle-4.10.2-all.zip
RUN mkdir -p /root/.gradle/wrapper/dists/gradle-4.10.2-all/9fahxiiecdb76a5g3aw9oi8rv
RUN unzip -qq gradle-4.10.2-all.zip
RUN mv gradle-4.10.2-all.zip /root/.gradle/wrapper/dists/gradle-4.10.2-all/9fahxiiecdb76a5g3aw9oi8rv
RUN mv gradle-4.10.2 /root/.gradle/wrapper/dists/gradle-4.10.2-all/9fahxiiecdb76a5g3aw9oi8rv
RUN touch /root/.gradle/wrapper/dists/gradle-4.10.2-all/9fahxiiecdb76a5g3aw9oi8rv/gradle-4.10.2-all.zip.ok
RUN touch /root/.gradle/wrapper/dists/gradle-4.10.2-all/9fahxiiecdb76a5g3aw9oi8rv/gradle-4.10.2-all.zip.lck
RUN chmod 755 /root/.gradle/wrapper/dists/gradle-4.10.2-all/9fahxiiecdb76a5g3aw9oi8rv/gradle-4.10.2/bin/gradle
