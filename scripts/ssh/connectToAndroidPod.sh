#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Please provide an environment name as a first argument"
  exit 1
fi

if [ -z "$2" ]; then
  echo "Please provide a pod name as a second argument"
  exit 1
fi

kubectl --namespace $1 exec -it $2 -- /bin/bash
