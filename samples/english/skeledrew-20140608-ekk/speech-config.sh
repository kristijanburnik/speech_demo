#!/bin/sh

if [ "$SR_API_KEY" == "" ]; then
  echo "Missing SR_API_KEY env variable!"  1>&2
  echo "enter api key here: "
  read $SR_API_KEY
  export SR_API_KEY
  if [ $(cat ~/.bashrc | grep "SR_API_KEY" | wc -l) -eq 0  ]; then
    echo "Append it to ~/.bashrc? (y/n) [n]: "
    read ans
    if [ "${$ans,,}" == "y" ]; then
      echo "" >> ~/.bashrc
      echo "# SR API KEY" >> ~/.bashrc
      echo "export SR_API_KEY=\"$SR_API_KEY\"" >> ~/.bashrc
    fi
  fi
fi


NONSTREAMING_API_URL="https://www.google.com/speech-api/v2/recognize"
STREAMING_API_URL="https://www.google.com/speech-api/full-duplex/v1";

# The API key
key=$SR_API_KEY

# The client generates a 64-bit or larger random number
pair=$(./speech-generate-pair.sh)
# audio MIME type
format="audio/l16"
# bitrate
# rate="48000"
rate="16000"
# which speech service
# language_model="search"
# language
language="en-US"
# client
client=$(hostname)


