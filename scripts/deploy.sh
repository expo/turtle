#!/usr/bin/env bash

set -eo pipefail

SCRIPT_NAME=`basename "$0"`
DEPLOY_ENDPOINT_URL="https://circleci.com/api/v1.1/project/github/expo/turtle-deploy/tree/master"

if [[ -z "$1" || -z "$2" ]]; then
  echo "usage: ${bold}$SCRIPT_NAME PLATFORM ENVIRONMENT [FORCE]${normal}"
  exit 1
fi

PLATFORM="$1"
ENVIRONMENT="$2"

if [[ "$3" = "--force" ]]; then
  FORCE_DEPLOY="true"
fi

if [[ "$PLATFORM" != "android" && "$PLATFORM" != "ios" ]]; then
  echo "unsupported PLATFORM passed: ${bold}$PLATFORM${normal}"
  echo "valid values are: ${bold}android${normal}, ${bold}ios${normal}"
  exit 1
fi

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  echo "unsupported ENVIRONMENT passed: ${bold}$ENVIRONMENT${normal}"
  echo "valid values are: ${bold}staging${normal}, ${bold}production${normal}"
  exit 1
fi

if [[ ! -z "$CIRCLE_SHA1" ]]; then
  TURTLE_COMMIT="$CIRCLE_SHA1"
elif [[ -z "$FORCE_DEPLOY" ]]; then
  read -p "You're about to schedule a deploy, are you sure you want to deploy the current commit? (y/n) " -n 1 -r
  echo    # (optional) move to a new line
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "exiting..."
    exit 0
  else
    TURTLE_COMMIT=`git log --pretty=format:%H -1`
  fi
fi

if [[ -z "$TURTLE_BOT_CIRCLE_API_USER_TOKEN" ]]; then
  echo "Please set the TURTLE_BOT_CIRCLE_API_USER_TOKEN env variable."
  exit 1
fi

if [[ $FORCE_DEPLOY = "true" ]]; then
  curl -X POST \
    --header "Content-Type: application/json" \
    -u $TURTLE_BOT_CIRCLE_API_USER_TOKEN: \
    -d '
      {
        "build_parameters": {
          "CIRCLE_JOB": "deploy_'$PLATFORM'",
          "TURTLE_ENV": "'$ENVIRONMENT'",
          "TURTLE_FORCE_DEPLOY": "true"
        }
      }' \
    $DEPLOY_ENDPOINT_URL | jq -r .build_url
else
  curl -X POST \
    --header "Content-Type: application/json" \
    -u $TURTLE_BOT_CIRCLE_API_USER_TOKEN: \
    -d '
      {
        "build_parameters": {
          "CIRCLE_JOB": "deploy_'$PLATFORM'",
          "TURTLE_ENV": "'$ENVIRONMENT'",
          "TURTLE_COMMIT": "'$TURTLE_COMMIT'"
        }
      }' \
    $DEPLOY_ENDPOINT_URL | jq -r .build_url
fi
