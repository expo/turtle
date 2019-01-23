#!/usr/bin/env bash

set -eo pipefail

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/.. && pwd )"

$ROOT_DIR/node_modules/.bin/release-it -c $ROOT_DIR/.release-it.beta.json --preRelease=beta
