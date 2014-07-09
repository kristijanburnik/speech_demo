#!/bin/sh
while read line; do
	path=$(echo $line | cut -f1 -d' ' | cut -f3 -d'/')
	text=$(echo $line | cut -f2- -d' ')
	echo ${text,,} > texts/$path.txt
	echo ${text,,} ">" texts/$path.txt
done
