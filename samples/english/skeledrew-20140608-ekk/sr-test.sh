#!/bin/sh

prefix=$1

input_file="raw/$prefix.raw"
text_file="txt/$prefix.txt"
output_file="out/$prefix.out"
meta_file="meta/$prefix.meta"

[ ! -f "$input_file" ] && echo "Missing input file $input_file" 1>&2 && exit -1
[ ! -f "$text_file" ] && echo "Missing text file $text_file" 1>&2  && exit -1
[ ! -f "$text_file" ] && echo "Missing meta file $meta_file" 1>&2  && exit -1


[ ! -d "out" ] && mkdir "out"

speech-nonstreaming-test $input_file $meta_file > $output_file

