#!/usr/bin/env bash

ensure_link_exists() {
  if [ ! -L "$2" ]; then
    ln -s $1 $2
    echo "$2 link created"
  fi
}

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/.. && pwd )"
WORKINGDIR="$ROOT_DIR/workingdir/local"

if [ ! -d "$WORKINGDIR" ]; then
  mkdir -p $WORKINGDIR
  echo "$WORKINGDIR directory created"
fi

LINKS=( "template-files" "package.json" "android" "expokit-npm-package" "packages" "client-builds" "cpp" "exponent-view-template" "ios" "shellAppBase-builds" "shellAppWorkspaces")

for LINKNAME in ${LINKS[@]}; do
  ensure_link_exists "$EXPO_UNIVERSE_DIR/exponent/$LINKNAME" "$WORKINGDIR/$LINKNAME"
done
