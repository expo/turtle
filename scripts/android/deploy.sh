#!/usr/bin/env bash

set -xeo pipefail

environment=$1

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/../.. && pwd )"

retry5 gcloud container images add-tag $PREV_TAG $CURRENT_TAG

if [ "$environment" == "production" ]; then
  echo "Deploying Turtle to production..."
  export REPLICAS=10
  export ENVIRONMENT=production
elif [ "$environment" == "staging" ]; then
  echo "Deploying Turtle to staging..."
  export REPLICAS=1
  export ENVIRONMENT=staging
else
  echo "Unrecognized environment $environment"
  exit 1
fi

if ! retry5 gcloud container images describe "$CURRENT_TAG"; then
  echo "Unable to find image tagged with $CURRENT_TAG"
  exit 2
fi

echo "Environment set, found image, deploying..."

envsubst < $ROOT_DIR/k8s/android/turtle-deployment.template.yml | \
  kubectl apply --namespace "$environment" --validate=true -f -
