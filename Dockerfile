# see docker-base/Dockerfile to learn what's installed in the turtle-android-base image
FROM gcr.io/exponentjs/turtle-android-base:0.1.1

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
