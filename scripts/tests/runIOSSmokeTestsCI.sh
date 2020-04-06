#!/usr/bin/env bash

set -ueo pipefail

export NODE_ENV=test

export ENVIRONMENT="development"
export AWS_SQS_ANDROID_QUEUE_URL="https://sqs.us-west-2.amazonaws.com/274251141632/turtle_jobs_local_dominik_android_in.fifo"
export AWS_SQS_ANDROID_PRIORITY_QUEUE_URL="https://sqs.us-west-2.amazonaws.com/274251141632/turtle_jobs_local_dominik_android_in_priority.fifo"
export AWS_SQS_IOS_QUEUE_URL="https://sqs.us-west-2.amazonaws.com/274251141632/turtle_jobs_local_dominik_ios_in.fifo"
export AWS_SQS_IOS_PRIORITY_QUEUE_URL="https://sqs.us-west-2.amazonaws.com/274251141632/turtle_jobs_local_dominik_ios_in_priority.fifo"
export AWS_SQS_OUT_QUEUE_URL="https://sqs.us-west-2.amazonaws.com/274251141632/turtle_jobs_local_dominik_out.fifo"
export AWS_SQS_REGION="aws.west2"
export AWS_S3_BUCKET="exp-shell-app-assets"
export AWS_S3_REGION="us-west-1"
export AWS_CLOUDWATCH_REGION="us-west-1"
export API_PROTOCOL="https"
export API_HOSTNAME="staging.expo.io"
export API_PORT="443"
export REDIS_URL="noop"
export REDIS_CONFIG_URL="noop"
export DATADOG_DISABLED="true"
export TURTLE_SDK_VERSIONS_SECRET_TOKEN="noop"

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/../.. && pwd )"
$ROOT_DIR/scripts/ios/fetchRemoteIosTarball.sh

yarn test:smoke:ios
