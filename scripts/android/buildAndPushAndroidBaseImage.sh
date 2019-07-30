#!/usr/bin/env bash

set -eo pipefail

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/../.. && pwd )"

IMAGE_TAG="$1"
if [[ -z "$IMAGE_TAG" ]]; then
  echo "usage: yarn docker:build:android-base-image IMAGE_SEMVER"
  exit 1
fi

IMAGE_VERSION_FULL_NAME="gcr.io/exponentjs/turtle-android-base:$IMAGE_TAG"
IMAGE_LATEST_FULL_NAME="gcr.io/exponentjs/turtle-android-base:latest"

pushd $ROOT_DIR > /dev/null
echo docker build -f docker-base/Dockerfile -t "$IMAGE_VERSION_FULL_NAME" -t "$IMAGE_LATEST_FULL_NAME" .
echo "Successfully built $IMAGE_VERSION_FULL_NAME Docker image"
echo gcloud docker -- push "$IMAGE_VERSION_FULL_NAME"
echo gcloud docker -- push "$IMAGE_LATEST_FULL_NAME"
echo "Successfully pushed $IMAGE_VERSION_FULL_NAME Docker image to GCloud"
popd  > /dev/null
