#!/bin/sh

python -S -c "import random; print format(random.randrange(0x1111111111111111,0xFFFFFFFFFFFFFFFF),'02X')"


