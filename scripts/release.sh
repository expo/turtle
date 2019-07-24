#!/usr/bin/env bash

set -eo pipefail

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/.. && pwd )"

if [[ -z "$GITHUB_TOKEN" || -z "$CIRCLE_API_USER_TOKEN" ]]; then
  yellow=`tput setaf 3`
  reset=`tput sgr0`
  echo "${yellow}please set GITHUB_TOKEN and CIRCLE_API_USER_TOKEN env variables in .envrc.local file if you wish to release turtle-cli"
  echo "run 'cp .envrc.local.example .envrc.local' if you don't have one yet and edit the new file${reset}"
  exit 1
fi

$ROOT_DIR/node_modules/.bin/release-it
echo
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo "!!!! PLEASE REMEMBER TO UPDATE CHANGELOG !!!!"
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
