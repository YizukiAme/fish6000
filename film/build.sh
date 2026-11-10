#!/bin/sh
# 和 python build.py 一样：把源码拼成 ../film.html
cd "$(dirname "$0")/.." && exec python3 build.py "$@"
