#!/usr/bin/python
import sys
import json
import difflib

def compare( expected , actual ):
  ex = expected.split(' ')
  ac = actual.split(' ')
  sm = difflib.SequenceMatcher(None,ex,ac);
  return sm.ratio()


def parse_result( output_file , txt_file ):
  lines = [line.strip() for line in open(output_file)]
  expected = [line.strip() for line in open( txt_file )][0]
  results = []
  for line in lines:
    obj = json.loads(line)
    for alt in obj['result']:    
      for item in alt['alternative']:
        res = compare( expected , item['transcript'] )
        results.append( res )
        print "exp: ", expected
        print "act: ", item['transcript']
        print res
        print
  return results

prefix = sys.argv[1]

output_file = "out/" + prefix + ".out"
txt_file = "txt/" + prefix + ".txt"
result_file = "results/" + prefix + ".txt"

fp = open( result_file , "w" )

res = parse_result( output_file , txt_file )
for ratio in res:
  print >> fp , ratio



