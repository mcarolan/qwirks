#!/bin/bash
set -e
SCRIPT=$(readlink -f "$0")
BASEDIR=$(dirname $SCRIPT)
docker build -t mcarolan/qwirks-node -f Dockerfile.node $BASEDIR
docker push mcarolan/qwirks-node

docker build -t mcarolan/qwirks-redis -f Dockerfile.redis $BASEDIR
docker push mcarolan/qwirks-redis
