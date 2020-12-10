#!/usr/bin/env bash

set -eo pipefail

if ! command -v jq &> /dev/null
then
    echo "jq is not installed and is required by the release script. Install it through homebrew or your package manager of choice."
    exit
fi

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/.. && pwd )"

$ROOT_DIR/node_modules/.bin/release-it -c $ROOT_DIR/.release-it.beta.json --preRelease=beta
