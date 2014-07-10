#!/bin/sh

if [ "$1" == "" ] || [ "$2" == "" ]; then
  echo -e "\n\tUsage: $0 start end\n"
  exit -1
fi

dir="samples/english/skeledrew-20140608-ekk"
echo "["; 
for x in $(seq $1 $2); do 
  echo -e "{\n\tfilename:'$dir/samples/english/skeledrew-20140608-ekk/wav/rb-$x.wav',\n\ttitle:'Sample $x',\n\ttext:'$(cat $dir/txt/rb-$x.txt)'\n},"; 
done ;
echo "]"
exit 0
