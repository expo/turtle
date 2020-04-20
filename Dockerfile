# see docker-base/Dockerfile to learn what's installed in the turtle-android-base image
FROM gcr.io/exponentjs/turtle-android-base:0.4.0

ADD . /app/turtle

WORKDIR /app/turtle

RUN ./scripts/fetchRemoteTarballs.sh android

RUN ln -s /app/turtle/workingdir /app/workingdir && \
    for SDK_VERSION in `ls /app/workingdir/android/`; do \
      echo "preparing $SDK_VERSION shell app" && \
      cd /app/workingdir/android/$SDK_VERSION && \
      mv packages non-workspace-packages && \
      # Keep in sync with src/bin/setup/android/index.ts#_installNodeModules
      # --prod requires --ignore-scripts (otherwise
      # expo-yarn-workspaces errors as missing)
      yarn install --ignore-scripts --prod && \
      mv non-workspace-packages packages ; \
    done

ENV NODE_ENV "production"
ENV TURTLE_WORKING_DIR_PATH /app/turtle/workingdir/

ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf

CMD ["/usr/bin/supervisord"]
