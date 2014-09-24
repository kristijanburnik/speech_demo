import os
import json
import collections
import argparse
import subprocess
import random
import socket
from urllib import urlencode,quote_plus
from subprocess import Popen, PIPE

## Args

parser = argparse.ArgumentParser(description='Run remote speech API and collect results on quality.')
parser.add_argument('file', metavar='file', type=str,
                   help='Source file to check against')

# parser.add_argument('-p','--pythonic', help='Display as python would print',action="store_true")
# parser.add_argument('-d', '--deps', help='Display dependencies',action="store_true")
# parser.add_argument('-r', '--refs', help='Display getReferences',action="store_true")
# parser.add_argument('-b', '--barebones', help='Output raw list',action="store_true")
# parser.add_argument('-s','--stats', help='Display stats',action="store_true")

args = parser.parse_args()

###


STREAMING_API_URL="https://www.google.com/speech-api/full-duplex/v1"
API_KEY = os.environ['SR_API_KEY']
HOSTNAME = socket.gethostname() + ""
assert API_KEY != "", "Api key is empty"
###

def encode_to_params(dict, prefix='?'):
 return prefix + \
  '&'.join([ k + "=" + quote_plus(dict[k]) for k in dict.keys() ])

def extend(a,b):
  return dict(a.items() + b.items())

def curl(url, options=[] ):
  cmd = ["curl","-s"] + options + [url]
  p = subprocess.Popen(cmd, stdin=PIPE, stdout=PIPE, stderr=PIPE)
  return p

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

def genpair():
  return format(random.randrange(0x1111111111111111,0xFFFFFFFFFFFFFFFF),'02X')

def streaming_call(audio_params, params):
  pair = genpair()
  ds = downstream(pair)
  us = upstream(pair, audio_params, params)
  output, err = ds.communicate(b"")
  rc = us.returncode
  return output


def decode(text):
  """ Decode a line of json to a dictionary """
  # print "Decoding ", text
  return json.JSONDecoder(object_pairs_hook=collections.OrderedDict).decode(text);

def encode(data,indent=None):
  return json.dumps(data, indent=indent )


def recognize(audio_params, params):
  raw_text = streaming_call(audio_params, params)
  return [ decode(x) for x in raw_text.split("\n") if x != "" ]



params = {'lang':"en-US", "lm":"builtin:search"}
audio_params = {'filename':args.file, 'format':"audio/l16", 'rate':"48000"}
data = recognize(audio_params, params)
print encode(data)


