#-------------- base --------------#
FROM node:16-buster-slim AS base

RUN apt update && apt -y --no-install-recommends install bluez bluetooth;

WORKDIR /service
    
#-------------- build --------------#
FROM base AS build

RUN apt update && apt -y --no-install-recommends install make g++ build-essential libudev-dev python3

COPY ./ ./
RUN yarn install

#-------------- release --------------#
FROM base AS release

RUN apt -y autoremove \
    && apt clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /usr/share/doc/*
    
COPY --from=build /service ./
RUN mv node_modules / \
    && echo "NODE_PATH=/node_modules" >> /etc/environment
    
COPY ./docker/entrypoint.sh /
ENTRYPOINT sh /entrypoint.sh
