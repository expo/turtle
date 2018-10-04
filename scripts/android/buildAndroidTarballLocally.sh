#!/usr/bin/env bash

set -xeo pipefail

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/../.. && pwd )"
ARTIFACTS_DIR="$ROOT_DIR/artifacts"
TEMP_DIR="$ROOT_DIR/tmp"

mkdir -p $ARTIFACTS_DIR
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR
ln -s ${EXPO_UNIVERSE_DIR}/exponent/tools-public $TEMP_DIR/tools-public
ln -s ${EXPO_UNIVERSE_DIR}/exponent/__internal__ $TEMP_DIR/__internal__
ln -s ${EXPO_UNIVERSE_DIR}/exponent/template-files $TEMP_DIR/template-files
ln -s ${EXPO_UNIVERSE_DIR}/exponent/android $TEMP_DIR/android
ln -s ${EXPO_UNIVERSE_DIR}/exponent/package.json $TEMP_DIR/package.json
ln -s ${EXPO_UNIVERSE_DIR}/exponent/expokit-npm-package $TEMP_DIR/expokit-npm-package
ln -s ${EXPO_UNIVERSE_DIR}/exponent/modules $TEMP_DIR/modules
ln -s ${EXPO_UNIVERSE_DIR}/libraries/eslint-config-universe $TEMP_DIR/eslint-config-universe
ln -s ${EXPO_UNIVERSE_DIR}/libraries/json-file $TEMP_DIR/json-file
ln -s ${EXPO_UNIVERSE_DIR}/libraries/osascript $TEMP_DIR/osascript
ln -s ${EXPO_UNIVERSE_DIR}/libraries/schemer $TEMP_DIR/schemer
ln -s ${EXPO_UNIVERSE_DIR}/package.json $TEMP_DIR/universe-package.json
cd $TEMP_DIR; tar -czhf $ARTIFACTS_DIR/android-shell-builder.tar.gz .
rm -rf $TEMP_DIR
