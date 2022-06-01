#!/bin/bash
set -e
SCRIPT=$(readlink -f "$0")
BASEDIR=$(dirname $SCRIPT)
docker run --name qwirks-redis \
    --network qwirks \
    --restart unless-stopped \
    -d \
    mcarolan/qwirks-redis:latest

docker run --name qwirks-node \
    --network qwirks \
    -p 3000:3000 \
    -e REDIS_HOST=qwirks-redis \
    --restart unless-stopped \
    -d \
    mcarolan/qwirks-node:latest
