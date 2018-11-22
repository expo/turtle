#!/usr/bin/env bash

export NODE_ENV=test

export ENVIRONMENT="development"
export AWS_ACCESS_KEY_ID="aws_id"
export AWS_SECRET_ACCESS_KEY="secret"
export AWS_SQS_IOS_QUEUE_URL="https://sqs.us-west-2.amazonaws.com/274251141632/turtle_jobs_staging_ios_in.fifo"
export AWS_SQS_ANDROID_QUEUE_URL="https://sqs.us-west-2.amazonaws.com/274251141632/turtle_jobs_staging_android_in.fifo"
export AWS_SQS_OUT_QUEUE_URL="https://sqs.us-west-2.amazonaws.com/274251141632/turtle_jobs_staging_out.fifo"
export AWS_SQS_REGION="aws.west2"
export AWS_S3_BUCKET="exp-shell-app-assets"
export AWS_S3_REGION="us-west-1"
export AWS_CLOUDWATCH_REGION="us-west-1"
export API_PROTOCOL="http"
export API_HOSTNAME="localhost"
export API_PORT="3000"
export REDIS_URL="noop"

yarn test:smoke:android
yarn test:unit
