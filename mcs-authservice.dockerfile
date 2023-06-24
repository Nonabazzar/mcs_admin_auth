FROM ubuntu:16.04

LABEL description="AuthService"
LABEL version="3.1"
LABEL vendor="Everly"

ARG WORKING_DIR=/auth-svc
ARG COMMON_DIR=/common-helpers
ARG NON_ROOT_USER=everly
ARG PORT=50052

ENV NODE_ENV production

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y software-properties-common python g++ make build-essential libssl-dev apt-utils wget curl gcc g++ make

RUN curl --silent --location https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install --yes nodejs

RUN mkdir -p $WORKING_DIR/server/ \
    mkdir -p $WORKING_DIR/client/ \
    mkdir -p $COMMON_DIR/

# Common Helper Utils section
COPY ./common-helpers/package*.json $COMMON_DIR/
WORKDIR $COMMON_DIR/
RUN npm install
COPY ./common-helpers/ $COMMON_DIR

# Auth Service Helper Utils section

COPY ./auth-svc/server/package*.json $WORKING_DIR/server/
WORKDIR $WORKING_DIR/server
# FOR PRODUCTION, --only=production
RUN npm install
COPY ./auth-svc/server $WORKING_DIR/server/
COPY ./auth-svc/server/.env $WORKING_DIR/server/.env

COPY ./auth-svc/client/package*.json $WORKING_DIR/client/
WORKDIR $WORKING_DIR/client
RUN npm install
COPY ./auth-svc/client $WORKING_DIR/client/

WORKDIR $WORKING_DIR/server/

#Expose the port
EXPOSE $PORT

#RUN groupadd -r $NON_ROOT_USER && useradd --no-log-init -r -g /bin/bash $NON_ROOT_USER $NON_ROOT_USER
#USER $NON_ROOT_USER

CMD [ "node", "server.js" ]

