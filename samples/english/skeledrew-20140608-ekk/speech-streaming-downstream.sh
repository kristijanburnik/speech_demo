#!/bin/sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $DIR/speech-config.sh

if [ "$1" == "" ]; then
  echo "Usage: $0 pair_key"  1>&2
  exit -1
fi

pair=$1

curl -s \
 "$STREAMING_API_URL/down?pair=$pair"
