#!/usr/bin/env bash

export NODE_ENV=test

export ENVIRONMENT="development"
export AWS_SQS_IOS_QUEUE_URL="https://sqs.us-west-2.amazonaws.com/274251141632/turtle_jobs_local_jakub_ios_in.fifo"
export AWS_SQS_ANDROID_QUEUE_URL="https://sqs.us-west-2.amazonaws.com/274251141632/turtle_jobs_local_jakub_android_in.fifo"
export AWS_SQS_IOS_PRIORITY_QUEUE_URL="https://sqs.us-west-2.amazonaws.com/274251141632/turtle_jobs_local_jakub_ios_in_priority.fifo"
export AWS_SQS_ANDROID_PRIORITY_QUEUE_URL="https://sqs.us-west-2.amazonaws.com/274251141632/turtle_jobs_local_jakub_android_in_priority.fifo"
export AWS_SQS_OUT_QUEUE_URL="https://sqs.us-west-2.amazonaws.com/274251141632/turtle_jobs_local_jakub_out.fifo"
export AWS_SQS_REGION="aws.west2"
export AWS_S3_BUCKET="exp-shell-app-assets"
export AWS_S3_REGION="us-west-1"
export AWS_CLOUDWATCH_REGION="us-west-1"
export API_PROTOCOL="https"
export API_HOSTNAME="staging.expo.io"
export API_PORT="443"
export REDIS_URL="noop"
export REDIS_CONFIG_URL="noop"

yarn init-workingdir:remote-ios

yarn test:smoke:ios
smoke_result=$?

yarn test:unit
unit_result=$?

[[ $smoke_result != 0 || $unit_result != 0 ]] && \
	echo && \
	echo "Tests failed." && \
	exit -1

exit 0
