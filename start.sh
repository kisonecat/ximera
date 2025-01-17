#!/bin/bash

echo "Starting redis, mongod en ximera"

echo "$(date +%F_%X) Starting redis, mongod en ximera" >>/usr/var/server/repositories/start.history

LOGFILE=/usr/var/server/repositories/start.$(date +%Y%m%d_%H%M%S).log

redis-server &
mongod &

sleep 5 # give mongo time to start ...

#echo "Copying files"
#ln -s  /usr/var/server2/node_modules  node_modules

#cp siunitx.js  node_modules/mathjax/extensions/TeX

#echo "Building npm"
#npm run build


echo "Starting npm"
npm run start 2>&1 | tee $LOGFILE
