
This repo contains a version of the Ximera server.

# Building a ximeraserver docker image

The Dockerfile adds the current folder to a `baseserver` image that is *very* old, and seems hard to rebuild/update.




# Build of baseserver image

Following hack got a base server, on which the ximeraServer code con be deployed.
Hopefully, at some point the baseserver will be properly (re-)build, or obsoleted alltogether.

The baseserver image was extracted from a KULeuven ximeraserver by a combination of

* docker export  -o image.tar ximeraserver    # extract full filesystem from 
* tar -xvf image.tar                          # extract the tar-file in an empty folder
* remove some big files in usr/local/bin etc
* move node_modules into usr/var/server.base
* tar -cvf ../image.1.2.tar .
* docker import image.1.2.tar baseserver:v1.2
* docker run -it baseserver:v1.2 /bin/bash
* docker cp  sources.list `container`/etc/apt/sources/list
* (inside container) apt install vim strace
* docker commit `container` baseserver:v1.3

The archive-sources for the baseserver:

```
deb [trusted=yes] http://archive.debian.org/debian/ stretch main
deb-src [trusted=yes] http://archive.debian.org/debian/ stretch main
deb [trusted=yes] http://archive.debian.org/debian/ stretch-backports main
deb [trusted=yes] http://archive.debian.org/debian-security/ stretch/updates main
deb-src [trusted=yes] http://archive.debian.org/debian-security/ stretch/updates main
```

Don't tell anyone.