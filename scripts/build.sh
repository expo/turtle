#!/usr/bin/env bash

set -xeo pipefail

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/.. && pwd )"

if [ -z "$1" ]; then
  echo "Please specify a platform to build"
  exit 1
fi

PLATFORM=$1

yarn
yarn run build
if [ "$PLATFORM" = "android" ]; then
  echo "shell apps will be fetched when building a Docker image"
elif [ "$PLATFORM" = "ios" ]; then
  $ROOT_DIR/scripts/ios/fetchRemoteIosTarball.sh
fi


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
