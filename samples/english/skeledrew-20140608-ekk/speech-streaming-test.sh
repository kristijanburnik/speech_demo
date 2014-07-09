#!/bin/sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $DIR/speech-config.sh

additional_params=""

if [ "$2"  != "" ]; then
	additional_params="&$2";
	echo "Using additional params: $additional_params" 1>&2
fi

echo "DOWNSTREAM connect" 2>&1
#downstream
curl -s \
 "$STREAMING_API_URL/down?pair=$pair" > downstream.stt &
down_pid="$!"

echo "UPSTREAM connect" 2>&1
# upstream
curl -s \
 --header "Content-Type: $format; rate=$rate" \
 --data-binary @$1 \
 "$STREAMING_API_URL/up?lang=$language&lm=$language_model&client=$client&pair=$pair&key=${key}$additional_params" > /dev/null &
up_pid="$!"

while true; do

  clear

  waiting=0;
  echo -ne "UP: "
  is-running $up_pid && waiting=$((waiting+1)) && echo "open" 2>&1  || echo "closed" 2>&1
  echo -ne "DOWN: "
  is-running $down_pid && waiting=$((waiting+1)) && echo "open" 2>&1 || echo "closed" 2>&1;

  echo "Streaming SR results:"
  cat downstream.stt

  if [ $waiting -eq 0 ] ; then
    echo "Complete"
    exit 0;
  fi

  sleep 1;

done;

