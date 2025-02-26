#!/bin/bash

echo "Starting redis, mongod en ximera"

echo "$(date +%F_%X) Starting redis, mongod en ximera" >>/usr/var/server/repositories/start.history

LOGFILE=/usr/var/server/repositories/start.$(date +%Y%m%d_%H%M%S).log

redis-server &
mongod &


if [[ -e /usr/var/server/node_modules ]] 
then
    echo "Using node_modules in /usr/var/server"
else 
    echo "Linking node_modules from /usr/var/server.base  (ie, from the image)"
    ln -s /usr/var/server.base/node_modules /usr/var/server/node_modules
fi

if [[ ! -d /usr/var/server/repositories ]] 
then
    echo "Using creating empty repositories folder"
    mkdir /usr/var/server/repositories
fi


# Use .env in repositories, because that folder is presumably mounted
if [[ -f /usr/var/server/repositories/.env ]] 
then
    echo "Using .env in /usr/var/server/repositories"
    . /usr/var/server/repositories/.env
    if [[ -e /usr/var/server/.env ]]
    then
        if [[ -L /usr/var/server/.env ]]
        then
            echo "/usr/var/server/.env is a symbolic link, as expected."
        else
            echo "Mmm, /usr/var/server/.env is NOT a symbolic link. Strange ..."
        fi
    else
        echo "Linking .env from /usr/var/server/repositories"
        ln -s /usr/var/server/repositories/.env /usr/var/server/.env
    fi
fi


if [[ -z "$SKIP_NPM_BUILD" ]]
then
    # This is needed when building a docker-image directly from a git-checkout: the .css/min.js etc are not there!
    echo "Running npm run build"
    npm run build
else
    sleep 5 # give mongo time to start ...
fi

# the default in the docker image might very well be port 3000 ...
: ${PORT:=2000}   
export PORT   

echo "Starting npm"
npm run start 2>&1 | tee $LOGFILE
