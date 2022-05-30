#!/bin/bash
set -e
SCRIPT=$(readlink -f "$0")
BASEDIR=$(dirname $SCRIPT)
docker run --name qwirks-redis \
    --network qwirks \
    -v $BASEDIR/redis.conf:/usr/local/etc/redis/redis-custom.conf \
    --restart unless-stopped \
    -d \
    mcarolan/qwirks-redis:latest

docker run --name qwirks-node \
    --network qwirks \
    -v $BASEDIR:/home/node/app \
    -v $BASEDIR/../shared:/home/node/shared \
    -p 3000:3000 \
    -e REDIS_HOST=qwirks-redis \
    --restart unless-stopped \
    -d \
    mcarolan/qwirks-node:latest
