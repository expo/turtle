#!/usr/bin/env bash

set -xeo pipefail

if [ -z "$1" ]; then
  echo "Please specify a platform to build"
  exit 1
fi

export PLATFORM=$1

yarn
yarn run build
yarn set-workingdir:remote

if [[ -z "${TARBALL}" ]]; then
  echo "TARBALL is not set, building tarball skipped"
else
  tar zcf "$TARBALL" \
    workingdir \
    build \
    scripts \
    package.json \
    node_modules \
    yarn.lock \
    tsconfig.json \
    gulpfile.js
fi
