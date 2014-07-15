#!/bin/sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $DIR/speech-config.sh

if [ "$1" == "" ] || [ "$2" == "" ] || [ "$3" == "" ]; then
  echo "Usage: $0 raw_audio_file meta_file pair_key"  1>&2
  exit -1
fi

source $2
pair=$3

echo "todo:remove"
STREAMING_API_URL="http://rtc-speech:8080";

### UPSTREAM ###

curl -s \
 --header "Content-Type: $format; rate=$rate" \
 --header "Transfer-Encoding: chunked" \
 --data-binary @$1 \
 "$STREAMING_API_URL/up?lang=$language&lm=$language_model&client=$client&pair=$pair&key=${key}$additional_params" > /dev/null &

