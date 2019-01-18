#!/usr/bin/env bash

export NODE_ENV=test

export ENVIRONMENT="development"
export AWS_ACCESS_KEY_ID="aws_id"
export AWS_SECRET_ACCESS_KEY="secret"
export AWS_SQS_IOS_QUEUE_URL="https://sqs.us-west-2.amazonaws.com/274251141632/turtle_jobs_staging_ios_in.fifo"
export AWS_SQS_IOS_PRIORITY_QUEUE_URL="https://sqs.us-west-2.amazonaws.com/274251141632/turtle_jobs_staging_ios_in.fifo"
export AWS_SQS_ANDROID_QUEUE_URL="https://sqs.us-west-2.amazonaws.com/274251141632/turtle_jobs_staging_android_in.fifo"
export AWS_SQS_ANDROID_PRIORITY_QUEUE_URL="https://sqs.us-west-2.amazonaws.com/274251141632/turtle_jobs_staging_android_in.fifo"
export AWS_SQS_OUT_QUEUE_URL="https://sqs.us-west-2.amazonaws.com/274251141632/turtle_jobs_staging_out.fifo"
export AWS_SQS_REGION="aws.west2"
export AWS_S3_BUCKET="exp-shell-app-assets"
export AWS_S3_REGION="us-west-1"
export AWS_CLOUDWATCH_REGION="us-west-1"
export API_PROTOCOL="http"
export API_HOSTNAME="localhost"
export API_PORT="3000"
export REDIS_URL="noop"
export REDIS_CONFIG_URL="noop"

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/.. && pwd )"
$ROOT_DIR/scripts/android/fetchRemoteAndroidTarball.sh

yarn test:smoke:android
smoke_result=$?

yarn test:unit
unit_result=$?

[[ $smoke_result != 0 || $unit_result != 0 ]] && \
	echo && \
	echo "Tests failed." && \
	exit -1

exit 0
