NOTE!
  The speech-config.sh file is missing intentionally because it contains sensitive data

Test Structure
  - raw/prefix.raw --> raw audio file
  - meta/prefix.meta --> sh script for setting sample rate
  - out/prefix.out --> results from the SR API
  - txt/prefix.txt --> the text being spoken
  - results/prefix.txt --> list of match ratios generated via parse-results.py

Adding new tests:
  - export audio to a raw format and save it as raw/rb-$num.raw
  - create meta file meta/rb-$num.meta and put following bash assignment:
      rate=$sample_rate
    where $sample_rate can be 16000 , ... , 48000
  - create text file txt/rb-$num.txt and write the expected sentence, only lowercase words

Running test for a single item:
  ./sr-test.sh rb-$num
  ./parse-results.py rb-$num
  echo $(date) -- $(./average-score.sh) >> score.history.txt
  for x in $(seq 18 $num); do ./parse-results.py rb-$x; done > results.details.txt
  git add .
  git commit -m "Added test rb-$num"
  git push origin master
  

$num is the test number --> see in raw/




