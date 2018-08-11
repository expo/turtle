#!/usr/bin/env bash

set -xeuo pipefail

environment=$1

retry5 gcloud container images add-tag "${IMAGE}:${PREV_TAG}" "${IMAGE}:${CURRENT_TAG}"
export TAG="${CURRENT_TAG}"

nix run expo.k8s-services.turtle.${environment}.deploy --command deploy
