# ITag MQTT Dispatch

This project was greatly inspired by tomasgatials itag-mqtt-bridge https://github.com/tomasgatial/itag-mqtt-bridge. Im very happy that i stumbled upon that piece of software, i realized how versatile language node really is.

Sadly my OPI2 Zero is giving me hard time and for some reason i cannot connect to my iTags with Noble library. Luckily i can still passively listen, so i repurposed the original project. 
With this, home assistant sees iTags as location_tracker entities and they can be attached to persons to indicate are they home or not. Home assistant auto-discovery is also available. 

# config
Configuration can be done via environment variables directly or with .env file

```
#LOG_LEVEL: default: debug (see: winston log levels)
LOG_LEVEL=info

#MQTT_BASE_TOPIC default: device_tracker. if you want to use hass auto-discovery, there are certain limitations what this can be. 
# check https://www.home-assistant.io/docs/mqtt/discovery/
MQTT_BASE_TOPIC=device_tracker

#MQTT_URL default: mqtt://localhost:1883 (see:mqtt.js format)
MQTT_URL=mqtt://localhost:1883

#MQTT_USERNAME default: null
MQTT_USERNAME=

#MQTT_PASSWORD default: null
MQTT_PASSWORD=

#whether or not to advertise friendly tags for hass. they have to be listed in FRIENDLY_TAGS variable
HASS_DISCOVERY=1

#this option can be used to obtain tag ids. if set to 1, itag-mqtt-dispatch will echo nearby tag ids to console (info log level) and also send them to ${MQTT_BASE_TOPIC}/IMQTT/discovery topic
DISCOVER=1

#when you have obtained the ids, you can list them here, separated by whitespace
#FRIENDLY_TAGS="iTAG-ff210610b0a2 iTAG-ff210610b0a1"
```

# MQTT Topics

topic | values | description
--- | --- | ---
${MQTT_BASE_TOPIC}/IMQTT/status | Online/Offline | itag-mqtt-dispatch service online
${MQTT_BASE_TOPIC}/IMQTT/discovery | ${device} | publish all devices found nearby
homeassistant/${MQTT_BASE_TOPIC}/${device}/config | hass configuration json | if HASS_DISCOVERY=1, advertise friendly devices
${this.baseTopic}/${device}/state | present/away | device state

# docker
arm64 and amd64 docker images are available at https://hub.docker.com/r/mikkoluos/itag-mqtt-dispatch

you can run the image from command line
```
docker run --cap-add=SYS_ADMIN --cap-add=NET_ADMIN --net=host -e"LOG_LEVEL=debug" -it mikkoluos/itag-mqtt-dispatch:latest
```
or you can use docker-compose
```
version: "3"
services:
  itag-mqtt-dispatch:
    container_name: itag-mqtt-dispatch
    image: mikkoluos/itag-mqtt-dispatch:latest
    environment:
      - DISCOVER=0
      - FRIENDLY_TAGS=iTAG-ff210610b0a2
    network_mode: host
    cap_add:
      - SYS_ADMIN
      - NET_ADMIN
```



