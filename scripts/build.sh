#!/usr/bin/env bash

set -xeo pipefail

yarn
yarn run build
# yarn install --production --ignore-scripts --prefer-offline

if [[ -z "${TARBALL}" ]]; then
  echo "TARBALL is not set, building tarball skipped"
else
  tar zcf "$TARBALL" \
    build \
    scripts \
    package.json \
    node_modules \
    yarn.lock \
    tsconfig.json \
    gulpfile.js
fi
