#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Please specify a nickname you used to create AWS SQS queues"
  exit 1
fi

TURTLE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/.. && pwd )"
TERRAFORM_DIR="${EXPO_UNIVERSE_DIR}/terraform"

ANDROID=`cd $TERRAFORM_DIR; terraform state show module.turtle_queues_local_$1.aws_sqs_queue.jobs_android_in | head -1 | cut -d"=" -f2 | xargs`
IOS=`cd $TERRAFORM_DIR; terraform state show module.turtle_queues_local_$1.aws_sqs_queue.jobs_ios_in | head -1 | cut -d"=" -f2 | xargs`
OUT=`cd $TERRAFORM_DIR; terraform state show module.turtle_queues_local_$1.aws_sqs_queue.jobs_out | head -1 | cut -d"=" -f2 | xargs`

cat << EOF > $TURTLE_DIR/.secrets.local
AWS_SQS_ANDROID_QUEUE_URL="$ANDROID"
AWS_SQS_IOS_QUEUE_URL="$IOS"
AWS_SQS_OUT_QUEUE_URL="$OUT"
TURTLE_FAKE_UPLOAD="1"
TURTLE_FAKE_UPLOAD_DIR="/Users/$USER/Downloads"
TURTLE_WORKING_DIR_PATH="$EXPO_UNIVERSE_DIR/server/turtle/workingdir"
TURTLE_USE_LOCAL_WORKING_DIR="1"
EOF
