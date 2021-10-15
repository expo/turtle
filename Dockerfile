# see docker-base/Dockerfile to learn what's installed in the turtle-android-base image
FROM gcr.io/exponentjs/turtle-android-base:0.6.0

ADD . /app/turtle

WORKDIR /app/turtle

RUN ./scripts/fetchRemoteTarballs.sh android

RUN ln -s /app/turtle/workingdir /app/workingdir && \
  for SDK_VERSION in `ls /app/workingdir/android/`; do \
  echo "preparing $SDK_VERSION shell app" && \
  cd /app/workingdir/android/$SDK_VERSION && \
  mv package.json copy_package.json && \
  jq '.workspaces.packages = ["packages/expo", "packages/expo-modules-autolinking"]' copy_package.json > package.json && \
  rm -f copy_package.json && \
  # Keep in sync with src/bin/setup/android/index.ts#_installNodeModules
  # --prod requires --ignore-scripts (otherwise
  # expo-yarn-workspaces errors as missing)
  yarn install --ignore-scripts --prod ; \
  done

ENV NODE_ENV "production"
ENV TURTLE_WORKING_DIR_PATH /app/turtle/workingdir/

ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf
ADD redislabs_ca.pem /var/run/config/redislabs-tls/redislabs_ca.pem

CMD ["/usr/bin/supervisord"]
