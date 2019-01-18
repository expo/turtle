#!/usr/bin/env bash

if [ -z "$EXPO_UNIVERSE_DIR" ]; then
  echo "You need to specify EXPO_UNIVERSE_DIR to use this script. Alternatively you can create .secrets.local-queue file yourself with AWS_SQS_ANDROID_QUEUE_URL, AWS_SQS_IOS_QUEUE_URL and AWS_SQS_OUT_QUEUE_URL variables."
  exit 1
fi

if [ -z "$1" ]; then
  echo "Please specify a nickname you used to create AWS SQS queues"
  exit 1
fi

TURTLE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/.. && pwd )"
TERRAFORM_DIR="${EXPO_UNIVERSE_DIR}/terraform"

ANDROID=`cd $TERRAFORM_DIR; terraform state show module.turtle_queues_local_$1.aws_sqs_queue.jobs_android_in | head -1 | cut -d"=" -f2 | xargs`
IOS=`cd $TERRAFORM_DIR; terraform state show module.turtle_queues_local_$1.aws_sqs_queue.jobs_ios_in | head -1 | cut -d"=" -f2 | xargs`
OUT=`cd $TERRAFORM_DIR; terraform state show module.turtle_queues_local_$1.aws_sqs_queue.jobs_out | head -1 | cut -d"=" -f2 | xargs`

cat << EOF > $TURTLE_DIR/.secrets.local-queue
AWS_SQS_ANDROID_QUEUE_URL="$ANDROID"
AWS_SQS_IOS_QUEUE_URL="$IOS"
AWS_SQS_OUT_QUEUE_URL="$OUT"
EOF

