#!/usr/bin/env bash

ENVIRONMENT=${1:-production}

govc vm.ip -wait 5s turtle-js-"${ENVIRONMENT}"-*
