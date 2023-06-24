FROM node:14-alpine3.13

MAINTAINER Shrawan Lakhe

ARG GRPC_HEALTH_PROBE_VERSION=v0.3.1
ENV GRPC_HEALTH_PROBE_VERSION=$GRPC_HEALTH_PROBE_VERSION

RUN apk update && \
    apk add python3 g++ imagemagick make curl git && \
    rm -rf /var/cache/apk/* && \
    wget -qO/bin/grpc_health_probe https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/${GRPC_HEALTH_PROBE_VERSION}/grpc_health_probe-linux-amd64 && \
    chmod +x /bin/grpc_health_probe 


LABEL description="admin_auth service"
LABEL version="3.1"
LABEL vendor="Ehub"

ARG WORKING_DIR=$HOME/backend/mcs/admin_auth
ARG COMMON_DIR=$HOME/backend/common-helpers
ARG PROTO_DIR=$HOME/ehub_proto
ARG NON_ROOT_USER=ehub
ARG PORT=50001

ENV NODE_ENV development

RUN mkdir -p $WORKING_DIR/server/ \
    mkdir -p $WORKING_DIR/client/ \
    mkdir -p $COMMON_DIR/ \
    mkdir -p $PROTO_DIR/

# Common Helper Utils section
COPY ./backend/common-helpers/package*.json $COMMON_DIR/
WORKDIR $COMMON_DIR/
RUN npm install
COPY ./backend/common-helpers/ $COMMON_DIR
RUN echo "" > $COMMON_DIR/conf/.env
COPY ./backend/common-helpers/conf/.env.docker $COMMON_DIR/conf/.env

# Protos section
COPY ./ehub_proto/package*.json $PROTO_DIR/
WORKDIR $PROTO_DIR/
RUN npm install
COPY ./ehub_proto/ $PROTO_DIR/

## Auth Service Client section

COPY ./backend/mcs/admin_auth/client/package*.json $WORKING_DIR/client/
WORKDIR $WORKING_DIR/client
RUN npm install
COPY ./backend/mcs/admin_auth/client/ $WORKING_DIR/client/

# Auth Service Server section

COPY ./backend/mcs/admin_auth/server/package*.json $WORKING_DIR/server/
WORKDIR $WORKING_DIR/server
# FOR PRODUCTION, --only=production
RUN npm install
COPY ./backend/mcs/admin_auth/server/ $WORKING_DIR/server/
RUN echo "" > $WORKING_DIR/server/conf/.env
COPY ./backend/mcs/admin_auth/server/conf/.env.stage.docker $WORKING_DIR/server/conf/.env

#Expose the port
EXPOSE $PORT

CMD [ "node", "server.js" ]