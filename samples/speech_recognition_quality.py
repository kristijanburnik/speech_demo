#!/usr/bin/python

import os
import sys
import json
import collections
import argparse
import subprocess
import random
import socket
import datetime
from urllib import urlencode,quote_plus
from subprocess import Popen, PIPE

## Args

parser = argparse.ArgumentParser(description='Run remote speech API and collect results on quality.')
parser.add_argument('input_file', metavar='file', type=str,
                   help='Input meta file')
parser.add_argument('-x','--mock', default=False,
                    help="Use mocked out service", action="store_true")

parser.add_argument('output_file', metavar='file', type=str,
                   help='Output file for saving results')

parser.add_argument('-l','--lang', default="en-US",
                    help="Language of input audio")

parser.add_argument('-m','--lm', default="builtin:search",
                    help="Language model")

parser.add_argument('-f','--format', default="audio/l16",
                    help="MIME type of audio")

parser.add_argument('-r','--rate', default="48000",
                    help="Sample rate of audio")

args = parser.parse_args()

###

STREAMING_API_URL="https://www.google.com/speech-api/full-duplex/v1"
API_KEY = os.environ['SR_API_KEY']
HOSTNAME = socket.gethostname() + ""
assert API_KEY != "", "Api key is empty"
###

# helpers

def encode_to_params(dict, prefix='?'):
 return prefix + \
  '&'.join([ k + "=" + quote_plus(dict[k]) for k in dict.keys() ])

def extend(a,b):
  return dict(a.items() + b.items())

def genpair():
  return format(random.randrange(0x1111111111111111,0xFFFFFFFFFFFFFFFF),'02X')

def decode(s):
  """ Decode a line of json to a dictionary """
  # print "Decoding ", text
  return json.JSONDecoder(object_pairs_hook=collections.OrderedDict).decode(s);

def encode(data,indent=None):
  """ Encode dictionary as JSON with optional formatting """
  return json.dumps(data, indent=indent )

def curl(url, options=[] ):
  cmd = ["curl","-s"] + options + [url]
  p = subprocess.Popen(cmd, stdin=PIPE, stdout=PIPE, stderr=PIPE)
  return p

# end/helpers

# s3-streaming-protocol

def downstream(pair):
  params = {'pair': pair}
  url = STREAMING_API_URL + "/down" + encode_to_params(params)
  return curl(url)

def upstream(pair, audio_params, params):
  default_params = {'key':API_KEY, 'pair':pair, 'client':HOSTNAME}
  url = STREAMING_API_URL  + "/up" + \
    encode_to_params(extend(default_params, params ))

  options = ["--header", "Content-type: " + audio_params['format'] + \
              "; rate=" +  audio_params['rate']] + \
            ["--data-binary", "@" + audio_params['filename']]
  return curl(url,options)

def streaming_call_sync(audio_params, params):
  pair = genpair()
  ds = downstream(pair)
  us = upstream(pair, audio_params, params)
  output, err = ds.communicate(b"")
  rc = us.returncode
  # if rc != 0:
  #  raise Exception("Process returned non-zero exit code " + str(rc))
  return output

def mock_recognize_sync(audio_params, params):
  """ Mocked out result for faster testing by avoiding to call the remote API """
  return [
      {"result": []},
      {"result": [
          {
            "alternative": [
              {"transcript": "modern computers have far more computing power than handheld devices"},
              {"transcript": "modern computers have far more computing power than hand held devices"},
              {"transcript": "modern computer have far more computing power than handheld devices"},
              {"transcript": "modern computers have fun more computing power than handheld devices"},
              {"transcript": "modern computers have for more computing power than handheld devices"}
            ],
            "final": True
          }
        ],
        "result_index": 0
      }
    ]


# end/s3-streaming-protocol

def recognize_sync(audio_params, params):
  """ Return speech recognition results as dict for an audio file """
  raw_text = streaming_call_sync(audio_params, params)
  return [ decode(x) for x in raw_text.split("\n") if x != "" ]

def do_recognize_sync(audio_params, params, mock=True):
  try:
    if args.mock:
      results = mock_recognize_sync(audio_params, params)
    else:
      results = recognize_sync(audio_params, params)
    status = "success"
    message = "OK"
  except:
    results = None
    status = "error"
    print sys.exc_info()
    message = "Unexpected error: " + str(sys.exc_info()[0])
  finally:
    pass

  return {
    'date': str(datetime.datetime.now()),
    'audio_params':audio_params,
    'params':params,
    'status':status,
    'message':message,
    'results': results
  }

##############################

#
# audio_params = {'filename':args.input_file, 'format':args.format, 'rate':args.rate}
# data = verbose_test_sync(audio_params, params)
# print encode(data, 2)

def load_samples(file):
  text = open(file).read()
  return json.JSONDecoder().decode(text);

def test_samples(samples, input_file_path):
  default_params = params = {'lang':args.lang, "lm":args.lm}
  default_audio_params = {'format':args.format, 'rate':args.rate}
  for sample in samples:
      audio_params = extend(default_audio_params, sample)
      audio_params['filename'] = os.path.join(input_file_path, audio_params['filename'])
      params = default_params
      yield do_recognize_sync(audio_params, params)


def write_partial(text,mode="a",sufix="\n"):
  f = open(args.output_file,mode)
  f.write(text + sufix)
  print text
  f.close()


def main():
  input_file_path = os.path.dirname(args.input_file)
  write_partial("[","w")
  index = 0
  samples = load_samples(args.input_file)
  for x in test_samples(samples, input_file_path):
    index += 1
    sufix = "," if index != len(samples) else ""
    write_partial( encode(x, 2) + sufix )
  write_partial("]")


main()
