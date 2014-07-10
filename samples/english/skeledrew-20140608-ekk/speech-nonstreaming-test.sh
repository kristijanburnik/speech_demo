#!/bin/sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $DIR/speech-config.sh


if [ "$1" == "" ] || [ "$2" == "" ]; then
  echo -e "\n\tUsage: $0 raw_audio_file_path [meta_script]\n"
  exit -1
fi
[ "$2" != "" ] && source $2


curl -s \
 --header "Content-Type: $format; rate=$rate" \
 --header "Connection: Keep-Alive" \
 --header "Transfer-Encoding: Chunked" \
 --data-binary @$1 \
 "$NONSTREAMING_API_URL?lang=$language&lm=$language_model&client=$client&key=$key&pair=$pair"


