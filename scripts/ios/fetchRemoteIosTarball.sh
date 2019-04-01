#!/usr/bin/env bash

set -xeo pipefail

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/../.. && pwd )"
ARTIFACTS_DIR="$ROOT_DIR/artifacts"
WORKING_DIR="$ROOT_DIR/workingdir/ios"
IOS_SHELL_TARBALLS_DIRECTORY="$ROOT_DIR/shellTarballs/ios"

mkdir -p $ARTIFACTS_DIR

download_shell_app() {
  SDK_VERSION=$1
  mkdir -p $WORKING_DIR/$SDK_VERSION
  TARBALL_URI=$(head -n 1 $IOS_SHELL_TARBALLS_DIRECTORY/$SDK_VERSION)
  if command -v run  >/dev/null 2>&1 ; then
    run expo.s3env --keep AWS_ACCESS_KEY_ID --keep AWS_SECRET_ACCESS_KEY --command retry5 aws s3 cp $TARBALL_URI $ARTIFACTS_DIR/$SDK_VERSION.tar.gz --no-progress
  else
    # outside of universe aws credentials might not be set
    if ! aws configure get aws_access_key_id >/dev/null 2>&1 ; then aws configure ; fi
    aws s3 cp $TARBALL_URI $ARTIFACTS_DIR/$SDK_VERSION.tar.gz --no-progress
  fi
  tar zxf $ARTIFACTS_DIR/$SDK_VERSION.tar.gz -C $WORKING_DIR/$SDK_VERSION
  rm -rf $TARBALL_URI $ARTIFACTS_DIR/$SDK_VERSION.tar.gz
}

if [[ -z "$SDK_VERSION" ]]; then
  for SDK_VERSION in `ls $IOS_SHELL_TARBALLS_DIRECTORY`; do
    download_shell_app $SDK_VERSION
  done
else
  if [ ! -d "$WORKING_DIR/$SDK_VERSION" ]; then
    download_shell_app $SDK_VERSION
  fi
fi
