#!/usr/bin/env bash

set -xeo pipefail

PLATFORM=$1

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/.. && pwd )"
ARTIFACTS_DIR="$ROOT_DIR/artifacts"
WORKING_DIR="$ROOT_DIR/workingdir/$PLATFORM"
SHELL_TARBALLS_DIRECTORY="$ROOT_DIR/shellTarballs/$PLATFORM"

mkdir -p $ARTIFACTS_DIR

convert_s3_to_https() {
  BUCKET=`echo $1 | sed 's/s3:\/\/\([^/]*\).*/\1/'`
  KEY=`echo $1 | sed 's/s3:\/\/[^/]*\/\(.*\)/\1/'`
  echo "https://s3.amazonaws.com/$BUCKET/$KEY"
}

download_shell_app() {
  SDK_VERSION=$1
  mkdir -p $WORKING_DIR/$SDK_VERSION
  TARBALL_S3_URL=$(head -n 1 $SHELL_TARBALLS_DIRECTORY/$SDK_VERSION)
  TARBALL_HTTPS_URL=$(convert_s3_to_https $TARBALL_S3_URL)
  curl -s $TARBALL_HTTPS_URL -o $ARTIFACTS_DIR/$SDK_VERSION.tar.gz
  tar zxf $ARTIFACTS_DIR/$SDK_VERSION.tar.gz -C $WORKING_DIR/$SDK_VERSION
  rm -rf $ARTIFACTS_DIR/$SDK_VERSION.tar.gz
}

if [[ -z "$SDK_VERSION" ]]; then
  for SDK_VERSION in `ls $SHELL_TARBALLS_DIRECTORY`; do
    download_shell_app $SDK_VERSION
  done
else
  if [ ! -d "$WORKING_DIR/$SDK_VERSION" ]; then
    download_shell_app $SDK_VERSION
  fi
fi
