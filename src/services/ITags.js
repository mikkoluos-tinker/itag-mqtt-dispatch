const noble = require("@abandonware/noble");
const log = require("winston");
const IMQTT = require("./IMQTT.js");
 
class ITags {
  /* list of tags to follow */
  friendlyIds = [];
  
  /* seconds until device times out */
  timeoutPeriod = 60;
  timeouts = {};
  
  discoverMode = false;
  discovered = [];
  
  hassDiscovery = false;
  
  constructor(env) {
    if (env.DISCOVER > 0)
      this.discoverMode = true;

    if (env.FRIENDLY_TAGS?.length) {
      this.friendlyIds = env.FRIENDLY_TAGS.split(" ");
      log.debug("FRIENDLY_TAGS environment variable: " + env.FRIENDLY_TAGS);
    }
    else
      this.discoverMode = true;
    
    if (this.discoverMode) 
      log.debug("discover mode enabled. all unknow tag ids will be echoed into console and dedicated MQTT topic");
    
    if (env.HASS_DISCOVERY == 1) {
      log.debug("home assistant discover mode enabled. if FRIENDLY_TAGS are present, they will be advertised  for home assistant autodiscovery");
      this.hassDiscovery = true;
    }
    
    /* set all known devices away at start, theyll come online soon if they are present */
    this.friendlyIds.forEach(e => IMQTT.publishTimeout(e));
    
    this.setNobleEvents();
  }
  setNobleEvents = () => {
    noble.on('stateChange', async (state) => {
        log.debug(`starting scan..`); 
        await noble.startScanningAsync([], true);
    });
    noble.on('discover', this.discover.bind(this));
    noble.on('scanStart', () => log.info("scanning started"));
  }
  deviceId = (peripheral) => {
    const nickname = String(peripheral.advertisement.localName || "__").trim();
    return `${nickname}-${peripheral.id}`;
  }
  discover = (peripheral) => {
    let device = this.deviceId(peripheral);
    let firstTime = false;
    
    if (!this.discovered.includes(device)) {
      log.debug(`discovered something new ${device}`);
      firstTime = true;
      this.discovered.push(device);
    }
    
    if (this.friendlyIds.includes(device)) {
      this.setNearby(device);
      
      if (this.hassDiscovery && firstTime)
        IMQTT.addDeviceToHass(device);
    }
    else if (this.discoverMode && firstTime) {
      IMQTT.publishDiscovered(device);
    }
  }
  setNearby = (device) => {
    if (!this.timeouts[ device ])
      /* if timeouts object has no record of this friendly device, we can assume it has just arrived */
      IMQTT.publishNearby(device);
    
    this.setTimeout(device);
  }
  setTimeout = (device) => {
    if (this.timeouts[ device ])
      /* if device already has a countdown going on, clear that and start a new one */
      clearTimeout(this.timeouts[ device ]);

    this.timeouts[ device ] = setTimeout(() => this.deviceTimedOut(device), this.timeoutPeriod * 1000);
  }
  deviceTimedOut = (device) => {
    /* timeoutPeriod has passed and we havent heard of the device. we can assume its gone */
    delete this.timeouts[ device ];
    IMQTT.publishTimeout(device);
  }
}

module.exports = ITags;
