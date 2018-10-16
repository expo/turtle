#!/usr/bin/env bash

set -xeo pipefail

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/../.. && pwd )"
ARTIFACTS_DIR="$ROOT_DIR/artifacts"
WORKING_DIR="$ROOT_DIR/workingdir/ios"
IOS_SHELL_TARBALLS_DIRECTORY="$ROOT_DIR/shellTarballs/ios"

mkdir -p $ARTIFACTS_DIR

for SDK_VERSION in `ls $IOS_SHELL_TARBALLS_DIRECTORY`; do
  mkdir -p $WORKING_DIR/$SDK_VERSION
  TARBALL_URI=$(head -n 1 $IOS_SHELL_TARBALLS_DIRECTORY/$SDK_VERSION)
  run expo.s3env --keep AWS_ACCESS_KEY_ID --keep AWS_SECRET_ACCESS_KEY --command retry5 aws s3 cp $TARBALL_URI $ARTIFACTS_DIR/$SDK_VERSION.tar.gz
  tar zxf $ARTIFACTS_DIR/$SDK_VERSION.tar.gz -C $WORKING_DIR/$SDK_VERSION
  rm -rf $TARBALL_URI $ARTIFACTS_DIR/$SDK_VERSION.tar.gz
done
