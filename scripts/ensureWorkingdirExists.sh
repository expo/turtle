#!/usr/bin/env bash

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/.. && pwd )"
WORKINGDIR="$ROOT_DIR/workingdir"

LINKS=( "android" "client-builds" "cpp" "exponent-view-template" "ios" "shellAppBase-builds" "shellAppWorkspaces" )
if [ ! -d "$WORKINGDIR" ]; then
  mkdir $WORKINGDIR
  echo "$WORKINGDIR directory created"
fi

for LINKNAME in ${LINKS[@]}; do
  FROM="$EXPO_UNIVERSE_DIR/exponent/$LINKNAME"
  TO="$WORKINGDIR/$LINKNAME"
  if [ ! -L "$TO" ]; then
    ln -s $FROM $TO
    echo "$TO link created"
  fi
done
