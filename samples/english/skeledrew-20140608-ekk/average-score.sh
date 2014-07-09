#!/bin/sh

tmp=$(mktemp)

cat results/* > $tmp
cat $tmp | awk '{ SUM += $1} END { print SUM/NR }' -
rm $tmp

