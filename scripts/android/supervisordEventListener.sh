#!/usr/bin/env bash

printf "READY\n"; # signal to superivsord that listener is ready

while read line; do
  echo "[supervisord:eventlistener] Processing Event: $line" >&2;
  kill -SIGQUIT $PPID
done < /dev/stdin
