#!/usr/bin/env bash

set -ueo pipefail

export NODE_ENV=test

export ENVIRONMENT="development"
export AWS_SQS_IOS_QUEUE_URL="noop"
export AWS_SQS_ANDROID_QUEUE_URL="noop"
export AWS_SQS_IOS_PRIORITY_QUEUE_URL="noop"
export AWS_SQS_ANDROID_PRIORITY_QUEUE_URL="noop"
export AWS_SQS_OUT_QUEUE_URL="noop"
export AWS_ACCESS_KEY_ID="noop"
export AWS_SECRET_ACCESS_KEY="noop"
export AWS_SQS_REGION="noop"
export AWS_S3_BUCKET="noop"
export AWS_S3_REGION="noop"
export AWS_CLOUDWATCH_REGION="noop"
export API_PROTOCOL="https"
export API_HOSTNAME="noop"
export API_PORT="443"
export REDIS_URL="noop"
export REDIS_CONFIG_URL="noop"
export DATADOG_DISABLED="true"
export TURTLE_SDK_VERSIONS_SECRET_TOKEN="noop"

yarn test:unit
