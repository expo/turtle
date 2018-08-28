#!/usr/bin/env bash

set -xeo pipefail

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/../.. && pwd )"
ARTIFACTS_DIR="$ROOT_DIR/artifacts"
WORKING_DIR="$ROOT_DIR/workingdir/android"
ANDROID_SHELL_TARBALL_FILE="$ROOT_DIR/shellTarballs/android"
ANDROID_SHELL_TARBALL_URI=$(head -n 1 $ANDROID_SHELL_TARBALL_FILE)

mkdir -p $WORKING_DIR
mkdir -p $ARTIFACTS_DIR
retry5 aws s3 cp $ANDROID_SHELL_TARBALL_URI $ARTIFACTS_DIR/android-shell-builder.tar.gz
tar zxf $ARTIFACTS_DIR/android-shell-builder.tar.gz -C $WORKING_DIR
rm -rf $ARTIFACTS_DIR/android-shell-builder.tar.gz
