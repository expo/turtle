#!/bin/bash

while read line; do
  echo "[supervisord:eventlistener] Processing Event: $line" >&2;
  kill -SIGQUIT $PPID
done < /dev/stdin
