FROM ghcr.io/ximeraproject/ximerabase:v1.3

WORKDIR /usr/var/server
ADD .  /usr/var/server


ENTRYPOINT [ "./start.sh" ]


