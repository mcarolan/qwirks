#!/bin/bash
SCRIPT=$(readlink -f "$0")
BASEDIR=$(dirname $SCRIPT)
docker create --name qwirks-redis \
    --network qwirks \
    -v $BASEDIR/redis.conf:/usr/local/etc/redis/redis-custom.conf \
    --restart unless-stopped \
    server_redis

docker create --name qwirks-node \
    --network qwirks \
    -v $BASEDIR:/home/node/app \
    -v $BASEDIR/../shared:/home/node/shared \
    -p 3000:3000 \
    -e REDIS_HOST=qwirks-redis \
    --restart unless-stopped \
    server_node
