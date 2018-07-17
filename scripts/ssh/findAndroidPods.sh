#!/usr/bin/env bash

ENVIRONMENT=${1:-production}

kubectl get pods --namespace $ENVIRONMENT | grep "turtle-android-" | sed -e "s/  */ /g" | cut -d" " -f1
