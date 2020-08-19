#!/usr/bin/env bash

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/.. && pwd )"

DOWNLOAD_DIR="${EXPO_DOWNLOAD_DIR:-$HOME/Downloads}"

mkdir -p $DOWNLOAD_DIR

if [ ! -f "$ROOT_DIR/.secrets.local-queue" ]; then
  echo "You need to run \"yarn secrets:init-private [SQS_NAME]\" or create the .secrets.local-queue file yourself with AWS_SQS_ANDROID_QUEUE_URL, AWS_SQS_ANDROID_PRIORITY_QUEUE_URL, AWS_SQS_IOS_QUEUE_URL, and AWS_SQS_IOS_PRIORITY_QUEUE_URL variables."
  exit 1
fi

# @dsokal: this is currently broken
#
# setup_local() {
#   ensure_link_exists() {
#     if [ ! -L "$2" ]; then
#       ln -s $1 $2
#       echo "$2 link created"
#     fi
#   }
#   WORKINGDIR="$ROOT_DIR/workingdir/local"
#
#   if [[ -d $WORKINGDIR ]]; then
#     echo "Local workingdir already prepared"
#     return
#   fi
#
#   if [[ -z "$EXPO_UNIVERSE_DIR" ]]; then
#     echo "EXPO_UNIVERSE_DIR needs to be set"
#     exit -1
#   fi
#
#   cd $EXPO_UNIVERSE_DIR/exponent && yarn
#   cd $EXPO_UNIVERSE_DIR/exponent/tools-public && yarn && ./generate-dynamic-macros-android.sh
#
#   mkdir -p $WORKINGDIR
#   echo "$WORKINGDIR directory created"
#
#   LINKS=("template-files" "package.json" "android" "expokit-npm-package" "packages" "client-builds" "cpp" "exponent-view-template" "ios" "shellAppBase-builds" "shellAppWorkspaces" "node_modules")
#
#   for LINKNAME in ${LINKS[@]}; do
#     ensure_link_exists "$EXPO_UNIVERSE_DIR/exponent/$LINKNAME" "$WORKINGDIR/$LINKNAME"
#   done
# }

setup_remote() {
  if [[ -d $ROOT_DIR/workingdir/android && -d $ROOT_DIR/workingdir/ios ]]; then
    echo "Shell apps already fetched"
  else
    echo "Fetching shell apps"
    if [ "$PLATFORM" != 'ios' ]; then
      $ROOT_DIR/scripts/android/fetchRemoteAndroidTarball.sh
    fi
    if [ "$PLATFORM" != 'android' ]; then
      $ROOT_DIR/scripts/ios/fetchRemoteIosTarball.sh
    fi
  fi

  for sdk in $ROOT_DIR/workingdir/android/* ; do
    if [[ -f "$sdk/universe-package.json" ]]; then
      mv $sdk/package.json $sdk/exponent-package.json
      mv $sdk/universe-package.json $sdk/package.json
      cd $sdk && yarn
    else
      if [[ -f "$sdk/package.json" ]]; then
        cd $sdk && yarn
      fi
    fi
  done
}

switch_local() {
cat << EOF > $ROOT_DIR/.secrets.local
TURTLE_FAKE_UPLOAD="1"
TURTLE_FAKE_UPLOAD_DIR="$HOME/Downloads"
TURTLE_WORKING_DIR_PATH="$ROOT_DIR/workingdir"
TURTLE_USE_LOCAL_WORKING_DIR="1"
EOF
}

switch_remote() {
cat << EOF > $ROOT_DIR/.secrets.local
TURTLE_FAKE_UPLOAD="1"
TURTLE_FAKE_UPLOAD_DIR="$HOME/Downloads"
TURTLE_WORKING_DIR_PATH="$ROOT_DIR/workingdir"
EOF
}

if [ "$1" == "local" ]; then
  # setup_local
  # switch_local
  echo "Setting local workingdir is currently broken, sorry :("
  exit -1
elif [ "$1" == "remote" ]; then
  setup_remote
  switch_remote
else
  echo "You need to pass remote or local as argument"
  exit -1
fi
