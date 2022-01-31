#!/bin/bash
set -e

cd client && npm run start &
cd server && npm run start &

read

trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT
