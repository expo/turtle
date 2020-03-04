#!/usr/bin/env bash

set -eo pipefail

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/../.. && pwd )"
CONFIGURE_ANDROID_SDK_PATH="$ROOT_DIR/scripts/android/configureAndroidSdk.sh"
DOCKER_BASE_DIR="$ROOT_DIR/docker-base"

IMAGE_TAG="$1"
if [[ -z "$IMAGE_TAG" ]]; then
  echo "usage: yarn docker:build:android-base-image IMAGE_SEMVER"
  exit 1
fi

IMAGE_VERSION_FULL_NAME="gcr.io/exponentjs/turtle-android-base:$IMAGE_TAG"
IMAGE_LATEST_FULL_NAME="gcr.io/exponentjs/turtle-android-base:latest"

pushd $DOCKER_BASE_DIR > /dev/null
cp $CONFIGURE_ANDROID_SDK_PATH .
docker build -t "$IMAGE_VERSION_FULL_NAME" -t "$IMAGE_LATEST_FULL_NAME" .
echo "Successfully built $IMAGE_VERSION_FULL_NAME Docker image"
gcloud docker -- push "$IMAGE_VERSION_FULL_NAME"
gcloud docker -- push "$IMAGE_LATEST_FULL_NAME"
echo "Successfully pushed $IMAGE_VERSION_FULL_NAME Docker image to GCloud"
rm -rf `basename $CONFIGURE_ANDROID_SDK_PATH`
popd  > /dev/null
