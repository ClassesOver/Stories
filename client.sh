#!/bin/sh
cd frontend
while true; do
    yarn install
    if [[ "$?" == "0" ]]; then
        break
    fi
    echo Deploy frontend command failed, retrying in 5 secs...
    sleep 5
done
exec yarn start
