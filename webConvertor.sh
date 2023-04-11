#!/bin/bash

if [ $# -eq 3 ]; then
    export DISPLAY=:6501
    Xvfb :6501 &
    ./webConvertor --input=$1 --output=$2 --delay=$3 --no-sandbox
else
    echo "usage : convert <input> <output> <delay>"
fi
